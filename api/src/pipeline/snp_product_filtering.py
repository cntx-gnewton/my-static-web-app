
import openpyxl
import pandas as pd
from os.path import join
from .utils.helpers import now
from .utils.decorators import record_time
import ast


import json

class FilterReader:
    def __init__(
        self,
        out_dir: str,
        name: str = 'products'
    ) -> None:

        self.name = name
        self.out_dir = out_dir

    def mk_read_path(self, step: str, file_type: str):
        return join(self.out_dir, step+file_type)

    def from_excel(self, step):
        read_path = self.mk_read_path(step, '.xlsx')
        return pd.read_excel(read_path)

    def from_csv(self, step):
        read_path = self.mk_read_path(step, '.csv')
        return pd.read_csv(read_path)

    def from_wkbk(self, step, sheet="Sheet1"):
        read_path = self.mk_read_path(step, '.xlsx')
        # Load the workbook
        workbook = openpyxl.load_workbook(read_path)
        # # Select the Sheet1 worksheet
        # worksheet = workbook[sheet]
        return workbook
    
    def from_json(self,step,) :
        read_path = self.mk_read_path(step, '.json')
        with open(read_path) as f:
            dict_obj = json.load(f)
        return dict_obj        

class FilterWriter:
    def __init__(
        self,
        out_dir: str,
        name: str = 'products'
    ) -> None:

        self.name = name
        self.out_dir = out_dir

    def mk_write_path(self, step: str, file_type: str):
        path=join(self.out_dir, step+file_type)
        print(f'WRITING - {path}')
        return path

    def to_excel(self, df, step, index=False):
        df.to_excel(
            self.mk_write_path(step, '.xlsx'),
            index=index
        )

    def to_csv(self, df, step, index=False):
        out_path = self.mk_write_path(step, '.csv')
        df.to_csv(out_path, index=index)

    def to_wkbk(self, wkbk, step, index=False):
        out_path = self.mk_write_path(step, '.xlsx')
        wkbk.save(out_path)

    def to_json(self, obj, step):
        out_path = self.mk_write_path(step, '.json')
        with open(out_path, 'w') as f:
            json.dump(obj, f, indent=4)

class ProductSNPFilter:
    def __init__(
            self,
            pipeline_config: dict,
            job_config: dict) -> None:
        """ in work_dir look for:
                snp_conditions

        Args:
            name (str): _description_
            work_dir (str): _description_
        """
        # Pipeline Configuration
        self.pipeline_config = pipeline_config
        self.job_dir = pipeline_config['namespaces']['jobs']
        self.external = pipeline_config['externals']
        # Job Configuration
        self.job_config = job_config
        self.name = self.job_config['metadata']['name']
        # Grab external resources
        self.products_path = self.external['products']        
        # Create Pipeline output directory for User Job
        self.out_dir = join(self.job_dir, self.name)
        # Create filesystem managers
        self.writer = FilterWriter(self.out_dir)
        self.reader = FilterReader(self.out_dir)
        # Create transformations dict
        self.snp_filter_history = {}
        # load products
        self.df = self.__load_input()

        self.columns = {
            'benefit': 5,
            'type': 3,
            'aspect': 6,
            'ingredient': 7,
            'concern': 8,
        }

    def __load_input(self):

        # Read the input .xlsx file into a pandas dataframe
        df = pd.read_excel(self.products_path)
        
        # Convert each value in the 3rd column to a string enclosed in curly braces
        column_3 = df.iloc[:, 2].apply(lambda x: "{'" + str(x) + "'}")
        # Replace the 3rd column in the dataframe with the new strings
        df.iloc[:, 2] = column_3
        
        # Replace underscores with spaces in the ingredient list column
        df['ingredient_list'] = df['ingredient_list'].str.replace('_', ' ')
        # Remove any numbers or percentage signs from the ingredient list column
        df['ingredient_list'] = df['ingredient_list'].str.replace(r'\d+[%]?', '', regex=True)
             
        print('loaded input')
        return df
    
    @record_time
    def filter_concerns(self, skin_condition_list:list):
        start_len = len(self.df)
        mask = self.df['concern_list'].fillna('na').apply(lambda x: any(condition in x for condition in skin_condition_list ))        
        self.df = self.df[mask]
        removed_products = start_len - len(self.df)
        # add to filter history
        self.snp_filter_history['filter_concerns'] = {
            'concerns':skin_condition_list,
            'removed_products':removed_products,
            'remaining_products':len(self.df)
        }
        
    @record_time
    def exclude(self, filter_col, filter_item):
        print(f'Running exclusive product {filter_item=}')
        start_len = len(self.df)
        self.df = self.df[self.df[filter_col].apply(lambda x: filter_item not in str(x))]
        # add to filter history
        removed_products = start_len - len(self.df)      
        self.snp_filter_history['exclude'] = {
            'filter_col':filter_col,
            'filter_item':filter_item,
            'removed_products':removed_products,
        }     
        return self
    
    @record_time
    def include(self, filter_col, filter_item):
        print(f'Running inclusive product {filter_item=}')
        start_len = len(self.df)
        # Filter the rows based on the condition
        self.df = self.df[self.df[filter_col].apply(lambda x: filter_item in str(x))]
        removed_products = start_len - len(self.df)        
        # add to filter history
        self.snp_filter_history['include'] = {
            'filter_col':filter_col,
            'filter_item':filter_item,
            'removed_products':removed_products,            
        }
        return self

    @record_time
    def filter_ingredients(self,ingredients:list):
        # Function to parse the ingredient_list column
        def parse_ingredient_list(s):
            try:
                return ast.literal_eval(s)
            except SyntaxError:
                s = s.replace('\\', '\\\\')
                return ast.literal_eval(s)

        self.df['ingredient_list'] = self.df['ingredient_list'].apply(parse_ingredient_list)

        # Function to count matching items in a given list
        def count_matching_items(item_list):
            return sum([1 for item in item_list if item.lower() in ingredients])

        # Count the matching items in the 'ingredient_list' column
        self.df['matching_items'] = self.df['ingredient_list'].apply(count_matching_items)

        # Filter out rows with 2 or more matching items
        start_len = len(self.df)        
        self.df = self.df[self.df['matching_items'] < 1].drop(columns=['matching_items'])
        removed_products = start_len - len(self.df)      
        
        # add to filter history
        self.snp_filter_history['filter_ingredients'] = {
            'ingredients':ingredients,
            'removed_products':removed_products,
            'remaining_products':len(self.df)
        }

        
    def save(self):
        self.snp_filter_history['proc_time'] = str(now())
        self.writer.to_excel(self.df, 'snp_filtered_products')
        self.writer.to_json(self.snp_filter_history,'snp_filter_history')
        return self

    @property
    def data(self):
        return self.df

    @property
    def filters(self):
        return self.df