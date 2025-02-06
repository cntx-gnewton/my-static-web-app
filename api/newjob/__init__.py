# Filename: api/newjob/__init__.py
# Description: This file contains the code for the newjob endpoint of the API.
import azure.functions as func
from os.path import join
import logging

from src.pipeline.utils.helpers import *
from src.pipeline.snp_pipeline import SNP_Pipeline

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('NewJob endpoint triggered.')
    logging.info(get_cwd())
    api_path = get_cwd().replace('\\', '/')
    config_path = join(api_path, 'configs')
    template_path = join(config_path, 'templates')
    os.environ['API_PATH'] = api_path
    os.environ['CONFIG_PATH'] = config_path
    os.environ['TEMPLATE_PATH'] = template_path
    
    # Check if the request method is POST
    if req.method == "POST":
        # Check if the request's content-type is multipart/form-data
        content_type = req.headers.get("Content-Type")
        if content_type and "multipart/form-data" in content_type:
            
            # Read the uploaded file
            file = req.files.get("file")
            logging.info(type(file))
            if file:
                JOB_NAME = file.filename.split('.')[0]
                pipeline_config = Template().render(
                    template_name="pipeline_template.yml",
                    jinja_vars={'api_path': os.environ['API_PATH']},
                    to_dict=True
                )['snp_pipeline']
                
                job_config = Template().render(
                    template_name="job_template.yml",
                    config_name=JOB_NAME,
                    output_dir=pipeline_config['namespaces']['jobs'],
                    jinja_vars={
                        'name': JOB_NAME,
                        'job_dir': pipeline_config['namespaces']['jobs']
                    },
                    to_dict=True
                )
                job_dir = mkdir(pipeline_config['namespaces']['jobs'])
                process_23andme(file, job_dir)
                
                logging.info(f"File uploaded: {file.filename}")
                logging.info(f"Running SNPipeline Job")
                try: 
                    pipeline = SNP_Pipeline(pipeline_config)
                    pipeline.run_job(job_config)
                    results = pipeline.serialize_products()
                    
                    return func.HttpResponse(results, mimetype="application/json")
                except Exception as e:
                    error_msg = f"Pipeline Error: {e}"
                    logging.error(error_msg)
                    return func.HttpResponse(error_msg, status_code=400)
                
                # Return a success message
                # return func.HttpResponse(f"File uploaded successfully: {file.filename}", status_code=200)
            else:
                return func.HttpResponse("No file found in the request.", status_code=400)
        else:
            return func.HttpResponse("Invalid content-type. Please send a multipart/form-data request.", status_code=400)
    else:
        return func.HttpResponse("Please send a POST request with a file.", status_code=400)
