from .utils.helpers import *
import yaml

def generate_job_config(name, file_path):
    # Define the YAML structure as a Python dictionary
    yaml_data = {
        'user_job': {
            'name': name,
            'risk_threshold': 0.3,
            'delimiter': '\t',
            'names': [
                'SNP',
                'Chromosome',
                'Position',
                'Genotype'
            ]
        }
    }

    # Write the YAML data to the file
    write_yaml(yaml_data,file_path)
        
def new_job(file):
    
    pipeline_config = read_yaml(
                r"C:\Users\greys\projects\cosnetix-marketplace\api\pipeline.yml")
    work_dir = pipeline_config['snp_pipeline']['work_dir']
    
    assert '.txt' in file.filename
    job_name = file.filename.replace('.txt','')
    job_file_path = join(work_dir,job_name+'.yml')
    generate_job_config(job_name,job_file_path)
    write_txt(file.read(), join(
        work_dir, f'{file.filename}'), remove_comments=True)
    return job_file_path