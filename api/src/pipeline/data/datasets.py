import logging
from functools import wraps
from .helpers import *

logging.basicConfig(level=logging.INFO)

class CustomLogger:

    def __init__(self, logger_name, log_level=logging.INFO, log_file=None):
        self.logger = logging.getLogger(logger_name)
        self.logger.setLevel(log_level)

        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s')

        if log_file:
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)

        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

    def debug(self, message):
        self.logger.debug(message)

    def info(self, message):
        self.logger.info(message)

    def warning(self, message):
        self.logger.warning(message)

    def error(self, message):
        self.logger.error(message)

    def critical(self, message):
        self.logger.critical(message)


def loggable(cls):
    @wraps(cls)
    def wrapper(*args, **kwargs):
        instance = cls(*args, **kwargs)
        logger_name = f"{cls.__module__}.{cls.__name__}"
        instance.log = CustomLogger(logger_name, log_level=logging.DEBUG)
        return instance
    return wrapper

# @loggable
class Dataset:
    def __init__(self, data_contract_path, name):
        self.__module__ = 'Dataset'
        self.__name__ = name
        # Store the data contract
        self.data_contract = read_yaml(data_contract_path)
        # Initialize the pystore
        store = pystore.store(self.data_contract['Datastore']['path'])
        # Set the dataset configuration
        self.cfg = self.data_contract[name]
        self.columns = self.cfg['columns']
        self.column_names = list(self.columns.keys())
        self.column_types = list(self.columns.values())
        self.collection = store.collection(self.cfg['name'])
        self.external_path = self.cfg['external'] if 'external' in self.cfg else None
        self.source = self.cfg['source'] if 'external' in self.cfg else None
        self.log = CustomLogger(f"{self.__module__}.{self.__name__}")
        
    def check_input(self, text):
        return True if isinstance(text, str) else False

    def query(self, query, apply_dtypes=False):
        query_result = self.collection.item(
            self.cfg['collections'][query]).to_pandas()
        return apply_column_types(query_result, self.columns) if apply_dtypes else query_result
    
    def write(self, data, collection, overwrite=False, source=None, proc_time=None, save_index=False):
        proc_time = pd.Timestamp.now() if not proc_time else proc_time
        source = self.source if not source else source
        
        self.collection.write(
            self.cfg['collections'][collection],
            data.reset_index(drop=True) if save_index else data,
            metadata={
                'source': source if not source else 'N/A',
                'last_updated': f'{proc_time}'
            },
            overwrite=overwrite,
        )
    
    def apply_types(self,df):
        return apply_column_types(df,self.columns)
    
    @staticmethod
    def fillna(df):
        df = df.replace('nan', np.nan)
        df = df.replace('', np.nan)
        df = df.fillna(value=np.nan)
        return df
    
    @property
    def raw(self):
        try:
            return self.query('raw')
        except Exception as e:
            print('Raw data not found. Storing raw data...')
            self.store_raw(True)
            return self.query('raw')

    @property
    def interim(self):
        try:
            return self.query('interim')
        except Exception as e:
            print('Interim data not found. Storing interim data...')
            self.store_interim(True)
            return self.query('interim')

    @property
    def processed(self):
        try:
            return self.query('processed', False)
        except Exception as e:
            print('Processed data not found. Storing processed data...')
            self.store_processed(True)
            return self.query('processed', False)

    def store_raw(self, overwrite):
        pass

    def store_interim(self, overwrite):
        pass

    def store_processed(self, overwrite):
        pass
    
# @loggable
class Ingredient(Dataset):
    def __init__(self, data_contract_path):
        self.name = 'Ingredient'
        super().__init__(data_contract_path, self.name)

    def store_raw(self, overwrite=False):
        collection_name = 'raw'
        data = pd.read_excel(self.external_path)
        self.write(
            data, 
            collection_name, 
            overwrite,
            proc_time = '2022-12-01'
        )

    def store_interim(self, overwrite=False):
        collection_name = 'interim'
        data = self.raw.copy(deep=True)
        data.rename(columns={c: c.lower() for c in data.columns}, inplace=True)
        data.replace('nan', np.nan, inplace=True)

        data.drop_duplicates(subset='name', inplace=True)
        data['ing_id'] = [i for i in range(1, len(data)+1)]
        data.set_index('ing_id', inplace=True)
        data = data.fillna(np.nan)

        # Regular expression pattern to match numbers followed by ' products'
        pattern = r'(\d+)\s*products'

        # Use str.extract() to extract the number from the strings in the column
        extracted_numbers = data['n_products'].astype(
            str).str.extract(pattern, expand=False)

        # Convert matching values to float and non-matching values to NaN
        data['n_products'] = pd.to_numeric(
            extracted_numbers, errors='coerce')

        data[['n_products', 'likes', 'dislikes']] = \
            data[['n_products', 'likes', 'dislikes']].apply(
                pd.to_numeric).astype('Int32')

        self.write(
            data,
            collection_name,
            overwrite,
            proc_time='2022-12-01'
        )
        
    def store_processed(self, overwrite=False):
        collection_name = 'processed'
        data = self.interim.fillna(np.nan)
        data = data.apply(self.__scrub_desc, axis=1)\
            .apply(self.__scrub_whatitis_benefits, axis=1)\
            .apply(self.__scrub_uses_concentration, axis=1)\
            .apply(self.__scrub_type, axis=1)\
            .apply(self.__scrub_references, axis=1)\
            .apply(self.__scrub_cosing_data, axis=1)[self.columns]

        print(col_nans(data))
        print(all_nans(data))
        data.to_excel(
            '/Users/greysonnewton/Library/CloudStorage/OneDrive-Personal/CNTX/cosneti/external/prod-ing/ingredients.xlsx',index=False)
        self.collection.write(
            self.cfg['collections']['processed'],
            data,
            collection_name,
            overwrite,
            proc_time='2022-12-01'
        )

    def __scrub_desc(self, row):
        text = row['description']
        if text is np.nan or text is not isinstance(text, str):
            return row
        desc = re.search(r'\bDescription\b', text, re.IGNORECASE)
        alias = re.search(r'\balso known as\b', text, re.IGNORECASE)
        usage_type = re.search(r'\bWhat it does\b', text, re.IGNORECASE)

        # description
        if desc is not None:
            if alias is not None:
                desc = text[desc.span()[1]:alias.span()[0]].strip()
            else:
                if usage_type is not None:
                    desc = text[desc.span()[1]:usage_type.span()[0]].strip()
                else:
                    desc = text[desc.span()[1]:].strip()
        else:
            desc = np.nan
        # alias
        if alias is not None:
            if usage_type is not None:
                alias = text[alias.span()[1]:usage_type.span()[0]].strip().replace(
                    '\n', '').replace(':', '')
            else:
                alias = text[alias.span()[1]:].strip()
        else:
            alias = np.nan

        # usage_type
        if usage_type is not None:
            usage_type = text[usage_type.span()[1]:].strip().replace(
                ': ', '').replace(':', '')
        else:
            usage_type = np.nan

        row['description'] = desc.replace('\n', '')
        row['alias'] = alias
        row['usage_type'] = usage_type
        return row

    def __scrub_whatitis_benefits(self, row):
        text = row['benefits_concerns']
        if text is not np.nan and isinstance(text, str):
            re_what_it_is = re.search(r'\bWhat it is:\s', text)
            if re_what_it_is is None:
                re_what_it_is = re.search(r'\bWhat it is\b', text)
            re_benefits = re.search(r'\bBenefits:\s', text)
            if re_benefits is None:
                re_benefits = re.search(r'\bBenefits\b', text)

            if re_what_it_is is None:
                what_it_is = np.nan
            else:
                if re_benefits is not None:
                    what_it_is = text[re_what_it_is.span()[1]:re_benefits.span()[
                        0]].strip()
                else:
                    what_it_is = text[re_what_it_is.span()[1]:].strip()

            if re_benefits is None:
                benefits = np.nan
            else:
                benefits = text[re_benefits.span()[1]:].strip()
                benefits_dict = {}
                for b in benefits.split('\n\n\n\n\n\n\n\n\n\n\n\n'):
                    benefit = b.split('\n\n\n')
                    if len(benefit) > 1:
                        benefits_dict[benefit[0]] = benefit[1]
                benefits = benefits_dict

            row['benefits'] = str(dict(benefits)) if benefits is not np.nan else np.nan
            row['what_it_is'] = str(what_it_is)

        else:
            row['benefits'] = np.nan
            row['what_it_is'] = np.nan
        return row

    def __scrub_uses_concentration(self, row):

        text = row['whereitsused']

        if text is not np.nan and isinstance(text, str):
            concentration = np.nan
            n_routines = np.nan
            categories = np.nan

            if 'concentration' in text or 'concentrations' in text:
                for sent in text.split('.'):
                    if 'concentration' in sent or 'concentrations' in text:
                        percentages = find_percentages(sent)
                        if percentages is None:
                            continue
                        elif len(percentages) == 1:
                            concentration = percentages[0]
                        elif len(percentages) == 2:
                            concentration = percentages[0] + \
                                ' - ' + percentages[1]
                        else:
                            print(percentages)
                            continue

            if 'skincare routines' in text or 'skincare routine' in text:
                for sent in text.split('.'):
                    if 'skincare routines' in sent or 'skincare routine' in sent:
                        re_n_routines = find_numbers(sent)
                        if re_n_routines is None:
                            continue
                        else:
                            try:
                                n_routines = int(re_n_routines[0])
                            except Exception as e:
                                print(e)
                                print(sent)
                                print(re_n_routines)
                                quit()

            re_categories = re.findall(r"{y: (.*?)\}", text)
            if len(re_categories) > 0:
                categories = []
                for cat in re_categories:
                    if len(cat.split(',')) > 1:
                        categories.append(cat.split(',')[0].replace("'", ''))
                    else:
                        continue

            row['n_routines'] = n_routines
            row['category'] = list(
                categories) if categories is not np.nan else np.nan
            row['concentration'] = concentration
            return row
        else:
            row['n_routines'] = np.nan
            row['category'] = str(np.nan)
            row['concentration'] = np.nan
            return row

    def __scrub_type(self, row):
        x = row['type']
        x.split(',') if isinstance(x, str) else np.nan
        row['type'] = x
        return row

    def __scrub_references(self, row):
        text = row['references']
        if text is not np.nan and isinstance(text, str):
            references = []
            for link in text.split('https:'):
                if '//' in link:
                    references.append(f'https:{link.strip()}')
            row['references'] = list(
                references) if references is not np.nan else np.nan
        else:
            row['references'] = np.nan

        return row

    def __scrub_cosing_data(self, row):
        text = row['cosing_data']
        if text is not np.nan and isinstance(text, str):
            scrubbed = scrub_cosing(text)
            row['cosing_data'] = dict(
                scrubbed) if scrubbed is not np.nan else np.nan
            return row
        else:
            text = row['common_products']
            if text is not np.nan and isinstance(text, str) and 'cosing' in text.lower():
                scrubbed = scrub_cosing(text)
                row['cosing_data'] = dict(
                    scrubbed) if scrubbed is not np.nan and isinstance(scrubbed, str) else np.nan
                return row
            else:
                row['cosing_data'] = np.nan
                return row


class Product(Dataset):
    def __init__(self, data_contract_path):
        self.name = 'Product'
        super().__init__(data_contract_path, self.name)

    def store_raw(self, overwrite=False):
        collection_name = 'raw'
        data = pd.read_excel(self.external_path)
        self.write(
            data,
            collection_name,
            overwrite,
            proc_time='2022-12-01'
        )
    def store_interim(self, overwrite=False):
        collection_name = 'interim'
        data = self.raw
        data.rename(columns={c: c.lower() for c in data.columns}, inplace=True)
        data.rename(columns={
            'notable_ingreadients': 'notable_ingredients', 'info': 'aspects'}, inplace=True)

        self.write(
            data, 
            collection_name, 
            overwrite, 
            'external/scraped', 
            proc_time = '2022-12-01'
        )
        
    def store_processed(self, overwrite=True):
        collection_name = 'processed'
        # deal with nans
        data = self.fillna(self.interim)
        
        # processing
        data = data.apply(self.__scrub_ingredients, axis=1)\
            .apply(self.__scrub_aspects, axis=1)\
            .apply(self.__scrub_concerns, axis=1)\
            .apply(self.__scrub_description_directions, axis=1)\
            .apply(self.__scrub_benefits, axis=1)[self.column_names]

        # data.benefit_list = data.benefit_list.apply(lambda x: {re.sub(
        #     r'^(_\n|_)|(_\n|_)$', '', k): v for k, v in x.items()} if x is not np.nan and x is not None else x)
        
        # deal with nans
        data = self.fillna(data)
        data = data.fillna(np.nan)
        print(data.shape)
        
        # encoding
        # data = self.__encode_aspects(data)
        # data = self.__encode_concerns(data)
        # data = self.__encode_benefits(data)
        # data = pd.DataFrame(data)

        # save
        # print(f"saving {self.cfg['collections']['processed']}")
        self.write(
            data, 
            collection_name, 
            overwrite, 
            'external/scraped', 
            proc_time = '2022-12-01'
        )

    def __encode_aspects(self, data):
        
        aspect_list = pd.DataFrame(
            data['aspect_list'].replace('nan', np.nan).fillna('[]').apply(to_literal))
        aspect_list['aspect_list'] = aspect_list['aspect_list'].apply(
            lambda x: list([k.strip() for k in x]))
        # Create an instance of MultiLabelBinarizer
        mlb = MultiLabelBinarizer()

        # Fit and transform the column
        data = data.join(
            pd.DataFrame(
                mlb.fit_transform(aspect_list['aspect_list']),
                index=data.index,
                columns=mlb.classes_))

        return data

    def __encode_concerns(self, data):
        
        concern_list = pd.DataFrame(
            data.copy(deep=True)['concern_list'].replace('nan', np.nan).fillna('{}').apply(to_literal))

        concern_list['concerns'] = concern_list['concern_list'].apply(
            lambda x: list([k.strip() for k in list(x.keys())]))

        # Create an instance of MultiLabelBinarizer
        mlb = MultiLabelBinarizer()

        # Fit and transform the column
        data = data.join(
            pd.DataFrame(
                mlb.fit_transform(concern_list['concerns']),
                index=data.index,
                columns=mlb.classes_))

        return data

    def __encode_benefits(self, data):
        
        benefit_list = pd.DataFrame(
            data.copy(deep=True)['benefit_list'].replace('nan', np.nan).fillna('{}').apply(to_literal))

        benefit_list['benefits'] = benefit_list['benefit_list'].apply(
            lambda x: list([k.strip() for k in list(x.keys())]))

        # Create an instance of MultiLabelBinarizer
        mlb = MultiLabelBinarizer()

        # Fit and transform the column
        data = data.join(
            pd.DataFrame(
                mlb.fit_transform(benefit_list['benefits']),
                index=data.index,
                columns=mlb.classes_)
        )

        return data

    def __scrub_description_directions(self, row):
        text = row['description_directions']
        if self.check_input(text):
            re_directions = re.search('\sDirections\s', text)
            re_description = re.search('Description\s', text)
            if re_description is None:
                description = np.nan
            if re_description is not None:
                if re_directions is not None:
                    description = text[re_description.end(
                    ):re_directions.start()].strip()
                    directions = text[re_directions.end():].strip()
                else:
                    description = text[re_description.end():].strip()
                    directions = np.nan
            else:
                description = np.nan
                directions = np.nan
        else:
            description = np.nan
            directions = np.nan
            
        row['description'] = description
        row['directions'] = directions
        return row

    def __scrub_ingredients(self,row):
        text = row['ingredients']
        if not self.check_input(text):
            ingredients = np.nan
        else:
            ing_num = re.search(r'\(\d+\)', text)
            if ing_num is not None:
                text = text[ing_num.end():].strip()
                ingredients = text.split('•')
                if len(ingredients) > 0:
                    ingredients = [i.strip()
                                   for i in ingredients if i.strip() != '']
                    ingredients = [
                        i.split('\n\n\n')[0] if '\n\n\n' in i else i for i in ingredients]
                else:
                    ingredients = np.nan
            else:
                if re.search('Product Info', text) is not None:
                    row['aspects'] = row['ingredients']
                    row['ingredients'] = np.nan
                ingredients = np.nan
        row['ingredient_list'] = str(list([i.lower().replace(' ', '_').strip(
        ) for i in ingredients])) if ingredients is not np.nan else np.nan
        return row

    def __scrub_aspects(self,row):
        text = row['aspects']
        if not self.check_input(text):
            aspects = np.nan
        else:
            aspects = text.split('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
            aspects = [a.strip() for a in aspects if a.strip() != '']
            aspects = [a.split('\n\n\n')[0]
                       if '\n\n\n' in a else a for a in aspects]
            aspects = [a[:re.search('\n\n \n', a).start()] if re.search(
                '\n\n \n', a) is not None else a for a in aspects]
            aspects = [a for a in aspects if 'Product Info' not in a]
            aspects = [a for a in aspects if len(a) < 50]
            aspects = [a.lower().replace(' ', '_').strip() for a in aspects]
        row['aspect_list'] = str(list([a.lower().replace(' ', '_').strip(
        ) for a in aspects])) if aspects is not np.nan else aspects
        return row

    def __scrub_concerns(self,row):
        text = row['concerns']
        # check and remove the concerns header
        if isinstance(text, str):
            # print(f'{text=}')
            concerns = {}
            split_text = re.split('\n+', text)
            if len(split_text) > 0:
                num_concerns = int(re.findall(
                    r'\d+', split_text[0])[0]) if len(re.findall(r'\d+', split_text[0])) > 0 else 0
                if int(num_concerns) == 0:
                    # print(' - error: no concerns')
                    concerns = np.nan
                else:
                    num_concern_statements = len(re.findall('May', text))
                    if num_concerns == 0 or num_concerns == 0:
                        concerns = np.nan
                    else:
                        if num_concern_statements != num_concerns:
                            print(
                                f' - error: {num_concerns=} | {num_concern_statements=}')
                            concerns = np.nan
                        else:
                            split_text = [s for s in split_text if 'from' not in s]
                            split_text = split_text[1:]
                            for i, split in enumerate(split_text):
                                if 'May' in split:
                                    if "•" in split_text[i+1]:
                                        ings = [i.strip()
                                                for i in split_text[i + 1].split("•")]
                                        ings = [i.rsplit(' ', 1)[
                                            0] if '%' in i else i for i in ings]

                                    else:
                                        ings = [split_text[i+1].strip()]
                                        ings = [i.rsplit(' ', 1)[
                                            0] if '%' in i else i for i in ings]

                                    concerns[split] = ings
            else:
                # print(' - error: no concern statements')
                concerns = np.nan
        else:
            concerns = np.nan

        row['concern_list'] = str(concerns)
        return row

    def __scrub_benefits(self,row):
        text = row['benefits']
        if not self.check_input(text) or 'Benefits (0)' in text:
            benefits = np.nan
        else:
            re_newl_split = re.split(r'\n{4,}', text)
            benefits, ings = [], []
            for b in re_newl_split:
                if 'Benefits' in b or 'Benefit' in b:
                    continue
                if 'from' in b or 'ingredient' in b:
                    if len(re.split(r'\n_\n\n', b)) > 0:
                        benefits.append(re.sub(
                            r'^(_\n|_)|(_\n|_)$',
                            '',
                            re.split(r'\n{2,}', re.split(
                                r'\n_\n\n', b)[0])[0]
                        )
                        )
                    else:
                        benefits.append(re.sub(
                            r'^(_\n|_)|(_\n|_)$',
                            '',
                            re.split(r'\n{2,}', b)[0]
                        )
                        )
                else:
                    ings.append([i.strip() for i in b.split('•')])

            benefit_list = str(dict(zip(benefits, ings)))
            row['benefit_list'] = benefit_list
            return row

# class GenomicProcessing(Dat)