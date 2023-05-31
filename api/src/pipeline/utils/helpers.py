from os.path import join, abspath, dirname
import sys
import shutil
import yaml
from os.path import join, exists, isfile
import pandas as pd
import os
import logging
from typing import *
from datetime import datetime
import logging

from typing import Any, Dict, Optional, Union
from jinja2 import Environment, FileSystemLoader
import os
from os.path import join
import logging
from os.path import join, abspath, dirname
import sys


def get_cfd(levels=1):
    curr_file_path = abspath(__file__)
    for _ in range(levels):
        curr_file_path = dirname(curr_file_path)
    return curr_file_path


def get_cwd(levels=0):
    cwd = os.getcwd()
    for _ in range(levels):
        cwd = dirname(cwd)
    return cwd

class Template:
    def __init__(self, template_dir: Optional[str] = None, config_dir: Optional[str] = None) -> None:
        """
        Initialize the Template class.

        Args:
            template_dir (Optional[str], optional): The template directory. If not provided,
                the TEMPLATE_PATH environment variable will be used. Defaults to None.
        
        Example:
            pipeline_config = Template().render('pipeline_template.yml', {'api_dir': os.getcwd()}, to_yaml=True)
        """
        self.config_dir = join(get_cwd(), 'configs') if config_dir is None else config_dir
        self.template_dir = join(self.config_dir, 'templates') if template_dir is None else template_dir
        self.env = Environment(loader=FileSystemLoader(self.template_dir))

    def render(
        self,
        template_name: str,
        jinja_vars: Dict[str, Any],
        config_name: Optional[str] = None,
        output_dir: Optional[str] = None,
        to_dict: Optional[bool] = False,
    ) -> Union[str, Dict, None]:
        """
        Render a Jinja2 template with the given variables and save the result to the output path.

        Args:
            template_name (str): The name of the Jinja2 template file.
            jinja_vars (Dict[str, Any]): A dictionary containing the variables to use in the template.
            output_path (Optional[str], optional): The path where the rendered configuration should be saved.
                Defaults to None.
            to_dict (Optional[bool], optional): Whether to return the rendered configuration as a YAML object.
                Defaults to False.

        Returns:
            Union[str, Dict, None]: The output path if to_dict is False, the YAML object if to_dict is True,
                or None if an error occurs.
        """
        # Load the Jinja2 template
        template_name = template_name + \
            ".yml" if not template_name.endswith(".yml") else template_name
        config_name = template_name.replace(
            "_template", "") if config_name is None else config_name+'.yml'
        output_dir = self.config_dir if output_dir is None else output_dir
        
        output_path = join(output_dir, config_name)
        logging.debug(f'{output_path=}')    
        print(f'{output_path=}')
        print(f"{template_name=}")
        
        template = self.env.get_template(template_name)
        try:
            # for key, value in jinja_vars.items():
            #     logging.info(f'rendering {key} {value}')
                
            rendered_config = template.render(**jinja_vars)
        except Exception as e:
            logging.error(f"Error rendering configuration: {e}")
            return None

        # Save the rendered configuration to the output file
        try:
            with open(output_path, "w") as config_file:
                config_file.write(rendered_config)
        except FileNotFoundError as e:
            logging.error(f"Error saving rendered configuration: {e}")
            return None

        # logging.info(f"Rendered configuration saved to '{output_path}'")
        return output_path if not to_dict else read_yaml(output_path)


def append_to_yaml(file_path: str, data: Dict, overwrite: bool = True) -> None:
    """
    Append a dictionary to a YAML file, overwriting it if it already exists in the file.

    This function appends the given dictionary to a YAML file located at the specified
    file path. If the dictionary already exists in the file, it overwrites it. Before
    adding the dictionary, the function adds a 'utc_proc_time' key with the current
    UTC time.

    Args:
        file_path (str): The path to the YAML file where the dictionary should be appended.
        data (Dict): The dictionary to append to the YAML file.
        overwrite (bool, optional): Whether to overwrite the existing dictionary in the file. Defaults to True.

    Returns:
        None: The function returns nothing.
        
    Example: 
        append_dict_to_yaml("/path/to/your/yaml_file.yml", {"key1": "value1", "key2": "value2"}, overwrite=False)    
    """


    
    # Read the existing data in the YAML file, if it exists
    existing_data = {} if not os.path.exists(file_path) else read_yaml(file_path)
    # add job_process_record metadata
    record = {
        'job_name': data['metadata']['name'],
        'job_number': len(existing_data.keys()) + 1,
        'utc_proc_time': datetime.utcnow().isoformat(),
        'job':{**data}}
    if overwrite:
        # Overwrite the existing data with the new data
        existing_data.update(record)
    else:

        logging.info(f'{record=}')
        # Append the new data without overwriting
        for key, value in record.items():
            if key not in existing_data:
                existing_data[key] = value

    # Write the updated data back to the YAML file
    with open(file_path, 'w') as file:
        yaml.safe_dump(existing_data, file,
                       default_flow_style=False, sort_keys=False)
    print(f"Appended dictionary to '{file_path}' with utc_proc_time added.")

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
    write_yaml(yaml_data, file_path)
    return file_path

def now():
    return pd.Timestamp.now(tz='UTC')

def assert_exists(path):
    path = str(path)
    assert isfile(path),f'FILE NOT FOUND: {path}'
    return path


def mv(input_file: str, output_path: str) -> None:
    if not os.path.isfile(input_file):
        raise FileNotFoundError(f"File '{input_file}' not found.")
    os.rename(input_file, os.path.join(
        output_path, os.path.basename(input_file)))


def cp(input_file: str, output_path: str) -> None:
    if not os.path.isfile(input_file):
        raise FileNotFoundError(f"File '{input_file}' not found.")
    shutil.copy2(input_file, output_path)


def mkdir(path):
    path = str(path)
    os.makedirs(path, exist_ok=True)
    return path
import os

def split_filepath(filepath):
    head, tail = os.path.split(filepath)
    return head, tail


def mkdir(filepath):
    filepath = str(filepath)
    os.makedirs(filepath, exist_ok=True)
    return filepath


def read_yaml(file_path):
    with open(file_path, 'r') as f:
        data = yaml.load(f, Loader=yaml.FullLoader)
    return data


def write_yaml(data, file_path):
    with open(file_path, 'w') as f:
        yaml.dump(data, f, default_flow_style=False)
    print(f'YML WRITE: {file_path}')


def write_txt(obj, file_path: str, remove_comments=False):
    with open(file_path, 'w') as f:
        f.write(str(obj))
    print(f'TXT WRITE: {file_path}')


def process_23andme(input_file, file_path: str) -> None:
    logging.info(f'process_23andme: {input_file.filename} | {file_path=} ')
    file_content = input_file.stream.read().decode("utf-8")
    file_path = join(file_path, input_file.filename)
    # Filter out lines that start with "#"
    filtered_content = "\n".join(
        [line for line in file_content.splitlines() if not line.startswith("#")])
    
    with open(file_path, 'w+') as output_file:
        output_file.write(filtered_content)
        
    print(f'23andMe Processed WRITE: {file_path}')

def move_file(input_path: str, output_path: str, rename:str=None) -> Optional[None]:
    """
    Move a file called 'mvfile' from the input path to the output path.

    This function moves a file named 'mvfile' from the specified input path
    to the output path. If the file doesn't exist at the input path, the function
    returns None.

    Args:
        input_path (str): The input path where the file named 'mvfile' is located.
        output_path (str): The output path where the file named 'mvfile' should be moved to.

    Returns:
        Optional[None]: Returns None if the file doesn't exist, otherwise it moves the file and returns nothing.
        
    Example:
        move_file("/input_dir/path/file.txt", "/output_dir/path/", rename="new_file_name.txt")
    """

    # Get the file's name
    name = os.path.basename(input_path) if rename is None else rename
    
    # Check if the file exists at the input path
    if not os.path.exists(input_path):
        print(f"File {name} not found at '{input_path}'.")
        return None

    # Move the file to the output path
    output_path = os.path.join(output_path, name)
    logging.info(f'{input_path=} | {output_path=}')
    shutil.move(input_path, output_path)


def get_cfd(levels:str=1) -> str:
    """Returns the path to the current folder.

    Args:
        levels: the number of levels up from the current folder to return
    Return
        current_file_path: the path to the current folder
    
    Example:
        project_dir = get_current_folder_path(2)
    """
    current_file_path = abspath(__file__)
    for _ in range(levels):
        current_file_path = dirname(current_file_path)
    return current_file_path


def find_abs_path(dir_name, relative_path: str) -> Optional[str]:
    """
    Find the absolute path of the 'api' folder given a relative path.

    :param relative_path: A string representing the relative path from the 'api' folder.
    :return: The absolute path of the 'api' folder or None if not found.
    """
    # Get the current working directory
    current_dir = os.getcwd()

    # Split the path into its components
    path_parts = relative_path.split(os.sep)

    # Traverse the path in reverse, searching for the 'api' folder
    for part in reversed(path_parts):
        if part == dir_name:
            # Reconstruct the absolute path of the 'api' folder
            api_path = os.path.join(
                current_dir, *path_parts[:path_parts.index(part) + 1])

            # Check if the path exists and return it
            if os.path.exists(api_path):
                return api_path

    # Return None if the 'api' folder is not found
    return None

def get_cwd(levels: int = 0) -> str:
    """Returns the path to the current folder.

    Args:
        levels: the number of levels up from the current folder to return
    Return
        current_file_path: the path to the current folder
    
    Example:
        project_dir = get_current_folder_path(2)
    """
    cwd = os.getcwd()
    if levels > 0:
        for _ in range(levels):
            cwd = dirname(cwd)
    return cwd

# class filesystem:
#     def __init__(
#         self,
#         name: str,
#         work_dir: str,
#     ) -> None:
#         self.name = name
#         self.work_dir = work_dir
#         self.risk_threshold = 0.3
#         self.out_dir = mkdir(join(self.work_dir, self.name))

#     def to_txt(self, obj, file_path: str):
#         with open(file_path, 'w') as f:
#             f.write(obj)
