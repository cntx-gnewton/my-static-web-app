import os
from typing import Optional
from jinja2 import Environment, FileSystemLoader
import logging
import os
import shutil
from typing import Optional
import os
from typing import Dict
from datetime import datetime



def move_file(input_path: str, output_path: str) -> Optional[None]:
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
    # Define the path to the file 'mvfile' at the input path
    mvfile_path = os.path.join(input_path, 'mvfile')

    # Check if the file exists at the input path
    if not os.path.exists(mvfile_path):
        return None

    # Move the file to the output path
    shutil.move(mvfile_path, os.path.join(output_path, 'mvfile'))

def render_jinja_template(env_var: str, template_path: str, output_path: Optional[str] = None) -> bool:
    """
    Render a Jinja2 template using the value of an environment variable.

    This function takes the name of an environment variable and the path to a Jinja2 template
    file as input. It renders the template using the value of the environment variable
    and saves the rendered configuration to a new file. If an output path is provided,
    the function saves the rendered configuration to that path; otherwise, it saves
    the rendered configuration to a file with the same name as the template, but
    without the '_template' part.

    Args:
        env_var (str): The name of the environment variable to use in rendering the template.
        template_path (str): The path to the Jinja2 template file.
        output_path (Optional[str]): The path to save the rendered configuration file.
                                      Defaults to None.

    Returns:
        bool: True if the template was successfully rendered and saved, False otherwise.
    """
    # Check if the environment variable exists
    if env_var not in os.environ:
        return None

    # Load the Jinja2 template
    template_dir, template_file = os.path.split(template_path)
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template(template_file)

    # Render the template using the value of the environment variable
    api_dir = os.environ[env_var]
    rendered_config = template.render(api_dir=api_dir)

    # Determine the output file path if not provided
    if output_path is None:
        output_path = template_path.replace("_template", "")

    # Save the rendered configuration to the output file
    with open(output_path, "w") as config_file:
        config_file.write(rendered_config)

    logging.info(f"Rendered configuration saved to '{output_path}'")
    return output_path
