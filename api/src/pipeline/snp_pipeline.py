from .snp_processing import SampleConditionRisks
from .snp_product_filtering import ProductSNPFilter
from .utils import *
from os.path import join
import logging

class SNP_Pipeline:
    def __init__(
        self,
        pipeline_config:Union[str,dict],
        surveyData: dict = None,
        ) -> None:
        
        self.pipeline_config = read_yaml(pipeline_config)['snp_pipeline'] if isinstance(pipeline_config,str) else pipeline_config
        self.work_dir = self.pipeline_config['namespaces']['jobs']
        self.config_dir = self.pipeline_config['namespaces']['configs']
        
        self.surveyData = surveyData
        self.survey_conditions = None
        if self.surveyData is not None and 'SkinConditions' in self.surveyData.keys():
            self.survey_conditions = self.surveyData['SkinConditions']
        logging.info(f'initialized Product Pipeline with {self.survey_conditions=}')    
        
        self.snp_condition_processor = SampleConditionRisks(self.pipeline_config)

    @property
    def input_sample(self):
        return self.snp_condition_processor.input_sample
    
    @property
    def products(self):
        return self.filtered_products
    
    @property
    def condition_risk_table(self):
        table = self.snp_condition_processor.condition_risk_table
        table = min_max_normalization(table,'risk_ratio')        
        table.risk_ratio = table.risk_ratio.apply(lambda x: round(x,2)*100)
        return table
    
    def run_job(self, job_config:Union[str,Dict]):
        
        # grab job configuration 
        job_config = read_yaml(job_config) if isinstance(
            job_config, str) else job_config
        logging.info(f'job_name: {job_config["metadata"]["name"]}')

        # generate snp_skin_conditions risk_table -> conditions to prevent and
        # harmful ingredients, helpful ingredients
        self.snp_condition_processor.process(job_config, self.survey_conditions)
        
        # insert quetionnaire filtering results
        if self.surveyData:
            skin_conditions = self.surveyData['SkinConditions']
        # Start Filtering Products
        snp_product_filter = ProductSNPFilter(
            self.pipeline_config,
            job_config
            )

        # SNP-Based Concern Product Filter
        snp_product_filter.filter_concerns(
            self.snp_condition_processor.condition_risks
            )

        # SNP-Based Concern Product Filter
        snp_product_filter.filter_ingredients(
            self.snp_condition_processor.ingredient_risks
            )
        
        # if self.survey_conditions:
        #     snp_product_filter.filter_survey_skin_conditions(
        #         self.survey_conditions
        #         )
        
        snp_product_filter.save()
        self.history = snp_product_filter.snp_filter_history
        self.filtered_products = snp_product_filter.df

        
    def serialize_products(self, n_to_show:int=20):
        products = self.products[["name", "type",
                                  "brand", "description"]].head(n_to_show)
        products['type'] = products['type'].apply(
            lambda x: x.replace("{'", '').replace("'}", ''))
        
        return products.to_json(orient='records')
            
    def serialize_results(self):
        return {
                "result": {
                    "products": self.products[["name","type","brand","description"]].head(20).to_json(orient='records'),
                    "snp_condition_risks": self.condition_risk_table.drop_duplicates().to_json(orient='records'),
                    "snp_input": self.input_sample.to_json(orient='records'),
                    "pipeline_history": self.history,
                }
            }
