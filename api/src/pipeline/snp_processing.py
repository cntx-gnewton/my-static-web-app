
import openpyxl
import pandas as pd
from os.path import join, exists, isfile
from .utils.helpers import *
import numpy as np
import os
import csv
from typing import *
class SNPData:
    def __init__(
        self,
        external: dict,
    ) -> pd.DataFrame:
        """Handles the SNP-Skin_Condition-Mapping. If it hasn't been
        preprocessed then it is preprocessed. ALw

        Args:
            input_dir (str, optional): _description_. Defaults to './SNP_data.csv'.
            output_dir (str, optional): _description_. Defaults to './snp_data.xlsx'.

        Returns:
            pd.DataFrame: snp_map
        """
        self.externals_dir = external
        self.input_dir = self.externals_dir['snp_data']
        self._serialize = {}
        
    def map(self):
        output_dir = split_filepath(self.input_dir)[0]+os.sep+'SNPMap.xlsx'
        print(f'SNPMap')
        print(f'\t->{self.input_dir=}')
        print(f'\t->{output_dir=}')        
        if not exists(output_dir):
            if self.input_dir.endswith('.csv'):
                self.snp_map = pd.read_csv(self.input_dir)
            elif self.input_dir.endswith('.xlsx'):
                self.snp_map = pd.read_excel(self.input_dir)
                
            self.snp_map = self.snp_map.rename(
                columns={c: c.strip().lower().replace(' ','_') for c in self.snp_map.columns})

            self.snp_map["skin_condition"] = self.snp_map["skin_condition"].ffill()
            self.snp_map.dropna(subset=["snp"], inplace=True)
            self.snp_map["higher_risk"] = self.snp_map["higher_risk"]\
                .apply(lambda x: [risk.strip() for risk in x.split(' or ')])
            self.snp_map = self.snp_map.apply(self.__add_second_risk_snp, axis=1)\
                .drop("higher_risk", axis=1)
                # .rename(columns={'Normal': 'normal_risk'})

            self.snp_map = self.snp_map.fillna('--')
            self.snp_map.to_excel(output_dir, index=False)
        else:
            self.snp_map = pd.read_excel(output_dir)
            
        self._serialize['snp_map'] = self.snp_map    
        return self.snp_map
            
    # def condition_map(self, conditions:list):
    #     # Create a mask that checks if the 'condition' column contains any item in the gene_con_list
    #     self.snp_condition_map = self.snp_map[mask]
    #     self._serialize['snp_condition_map'] = self.snp_condition_map
    #     return self.snp_condition_map

    def ingredient_map(self,conditions:list):
        output_dir = split_filepath(self.input_dir)[0]+os.sep+'SNPIngredients.xlsx'
        if not exists(output_dir):
            snp_ingredients = pd.read_excel(self.input_dir,sheet_name='Ingredients')
            snp_ingredients = snp_ingredients.rename(columns={c:c.strip().lower().replace(' ','_') for c in snp_ingredients.columns})
            snp_ingredients = snp_ingredients.drop(columns = [c for c in snp_ingredients.columns if 'unnamed' in c])
            snp_ingredients.skin_condition = snp_ingredients.skin_condition.ffill()
            self.snp_ingredients = snp_ingredients.dropna(subset=['helpful_ingredients','description','harmful_ingredients','description'])
            self.snp_ingredients.to_excel(output_dir,index=False)
        else:
            self.snp_ingredients = pd.read_excel(output_dir)
            
        mask = self.snp_ingredients['skin_condition'].apply(lambda x: any(condition in x for condition in conditions))        
        self.snp_ingredient_map = self.snp_ingredients[mask]
        self._serialize['snp_ingredient_map'] = self.snp_ingredient_map
        return self.snp_ingredient_map

    def serialize(self):
        return self._serialize
    
    def __add_second_risk_snp(self,row):
        risks = row["higher_risk"]
        if len(risks) == 2:
            row["high_risk_1"] = risks[0]
            row["high_risk_2"] = risks[1]

        elif len(risks) == 1:
            row["high_risk_1"] = risks[0]
            row["high_risk_2"] = np.nan

        else:
            row["high_risk_1"] = np.nan
            row["high_risk_2"] = np.nan
        return row
    
class SNPSample:
    def __init__(
        self,
        input_file:str,
        sample_config:dict,
        ) -> pd.DataFrame:
        """Processes and returns a given snp_sample.txt as a pd.DataFrame snp data.

        Args:
            input_file (str): _description_
            names (list, optional): _description_. Defaults to ['SNP', 'Chromosome', 'Position', 'Genotype'].
            delimiter (str, optional): _description_. Defaults to '\t'.

        Returns:
            pd.DataFrame: A user's snp data.
        """
        self.input_file = assert_exists(input_file)
        self.snp_sample = pd.read_csv(
            input_file, 
            sep=sample_config['delimiter'], 
            names=sample_config['names'],
            comment='#', 
            # sep='\t',
            engine='python',
            quoting=csv.QUOTE_NONE
            )
    @property
    def sample(self):
        return self.snp_sample

class SampleConditionRisks:
    def __init__(
        self,  
        pipeline_config:dict,
        ) -> None:
        """Calculates an snp-skin_condition-risk probability table
        given an snp_sample with 'name'.txt inside a 'work_dir',
        using our predefined snp-conditions-map.

        Args:
            name (str): name of user 
            work_dir (str): where the sample is stored
            risk_threshold (float, optional): sets the threshold that
                considers conditions to be genomically 'risky'. Defaults to 0.3.
        """
        self.pipeline_config = pipeline_config
        self.jobs_dir = pipeline_config['namespaces']['jobs']
        self.externals_dir = pipeline_config['externals']
        self.snp_data =  SNPData(self.externals_dir)
        self.snp_map = self.snp_data.map()
        
    @property
    def input_sample(self):
        return self.sample        
    
    @property
    def condition_risk_table(self):
        return self.skin_condition_risk_ratios
    
    @property
    def condition_risks(self):
        return self.skin_condition_list
    
    @property
    def ingredient_risks(self):
        return self.harmful_ingredients
    @property
    def ingredient_benefits(self):
        return self.helpful_ingredients
        
    def process(self,job_config):
        # read in snp_processing job config file
        if isinstance(job_config,str):
            job = read_yaml(job_config)
        elif isinstance(job_config, dict):
            job = job_config
        else:
            raise TypeError('snp_sample_config must be a dict or a path to a yaml file')

        name = job['metadata']['name']
        risk_threshold = job['risk_threshold']
        
        sample_file = join(self.jobs_dir, name+'.txt')
        out_dir = mkdir(join(self.jobs_dir,name))
        
        self.sample = SNPSample(sample_file,job).sample
        
        user_condition_risk_ratios = join(
            out_dir, 'skin_condition_risks.csv')
        
        filtered_sample = self.sample.set_index('SNP').join(self.snp_map.set_index('snp')).dropna()

        filtered_sample = filtered_sample.apply(self.apply_risk, axis=1)

        filtered_sample['risk_ratio'] = filtered_sample.groupby('skin_condition')[
            'risk'].transform(lambda x: x.sum() / len(x))

        filtered_sample = filtered_sample.sort_values(by=['skin_condition'])
        skin_condition_risk_ratios = filtered_sample[['skin_condition', 'risk_ratio']]
        skin_condition_risk_ratios.drop_duplicates()
        self.skin_condition_risk_ratios = skin_condition_risk_ratios\
            .reset_index(drop=True)\
            .drop_duplicates()\
        
        skin_condition_risk_ratios.to_csv(
            user_condition_risk_ratios,
                index=False
                )
        # mv(sample_file,join(out_dir,name+'txt'))
        
        # Filter the DataFrame based on the risk threshold
        filtered_skin_condition_risk_ratios = skin_condition_risk_ratios.loc[
            skin_condition_risk_ratios['risk_ratio'] >= risk_threshold]

        # Create a list from the 'Skin Condition' column
        self.skin_condition_list = list(set(
                filtered_skin_condition_risk_ratios['skin_condition'].tolist()
                ))
        
        write_txt(self.skin_condition_list, join(
            out_dir, 'skin_condition_list.txt'))
        
        self.snp_ingredient_map = self.snp_data.ingredient_map(self.skin_condition_list)
        
        self.helpful_ingredients = list(set(
            self.snp_ingredient_map['helpful_ingredients']\
                .apply(lambda x: x.lower() if isinstance(x, str) else x)\
                    .to_list()))
        
        self.harmful_ingredients = list(set(
            self.snp_ingredient_map['harmful_ingredients']\
                .apply(lambda x: x.lower() if isinstance(x, str) else x)\
                    .to_list()))
        write_txt(
            self.helpful_ingredients,
            join(out_dir, 'helpful_ingredients.txt'))
        write_txt(
            self.harmful_ingredients,
            join(out_dir, 'harmful_ingredients.txt'))
        
        append_to_yaml(
            join(self.pipeline_config['namespaces']['jobs'],'history.yml'), 
            job,
            overwrite=True
        )
        move_file(job['metadata']['config'], out_dir)
        # move_file(sample_file, out_dir)
        
        
    def apply_risk(self,row):
        risk = 0
        if row['Genotype'] == row['high_risk_1'] or row['Genotype'] == row['high_risk_2']:
            risk = 1
        row['risk'] = risk
        return row
