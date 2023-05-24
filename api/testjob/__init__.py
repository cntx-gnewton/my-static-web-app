import azure.functions as func
import logging
import os

from src.pipeline.snp_pipeline import SNP_Pipeline
from src.pipeline.utils.helpers import *

# if 'API_PATH' not in os.environ:
#     from dotenv import load_dotenv
#     load_dotenv()

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info(get_cwd())
    api_path = get_cwd().replace('\\','/')
    config_path = join(api_path, 'configs')
    template_path = join(config_path, 'templates')
    os.environ['API_PATH'] = api_path
    os.environ['CONFIG_PATH'] = config_path
    os.environ['TEMPLATE_PATH'] = template_path
    
    logging.info('Running SNPipeline Demo.')
    TEST_JOB_NAME = "genome_Test_Job"
    pipeline_config = Template().render(
        template_name="pipeline_template.yml",
        jinja_vars={'api_path': os.environ['API_PATH']},
        to_dict=True
    )['snp_pipeline']

    job_config = Template().render(
        template_name="job_template.yml",
        config_name=TEST_JOB_NAME,
        output_dir = pipeline_config['namespaces']['jobs'],
        jinja_vars={
            'name': TEST_JOB_NAME,
            'job_dir': pipeline_config['namespaces']['jobs']
            },
        to_dict=True
    )
    try:
        pipeline = SNP_Pipeline(pipeline_config)
        pipeline.run_job(job_config)
        results = pipeline.serialize_products()
        return func.HttpResponse(results, mimetype="application/json")
    
    except Exception as e:
        error_msg = f"Pipeline Error: {e}"
        logging.error(error_msg)
        return func.HttpResponse(error_msg, status_code=400)

    

    
