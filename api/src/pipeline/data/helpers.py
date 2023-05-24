import glob
import pandas as pd
import numpy as np
import re
import ast
import yaml
import sys


def to_literal(x):
    if isinstance(x, list) or isinstance(x, dict):
        return x
    if x is np.nan:
        return np.nan
    try:
        return ast.literal_eval(x)
    except Exception as e:
        print(e)
        print(f'{x} | {type(x)}: is not a literal')
        return np.nan

def safe_literal_eval(s):
    try:
        return ast.literal_eval(s)
    except (ValueError, SyntaxError):
        return s
    
def apply_column_types(df, column_types):
    """
    Apply data types to DataFrame columns based on a dictionary.

    Args:
        df (pd.DataFrame): The input DataFrame.
        column_types (dict): A dictionary with column names as keys and data types as values.

    Returns:
        pd.DataFrame: A new DataFrame with the specified data types applied to the columns.
    """
    df_new = df.copy()

    for column, dtype in column_types.items():
        if column not in df_new.columns:
            continue

        if dtype in ('list', 'dict'):
            df_new[column] = df_new[column].apply(safe_literal_eval)
         
        else:
            df_new[column] = df_new[column].astype(dtype)

    return df_new



def read_yaml(file_path):
    with open(file_path, 'r') as f:
        data = yaml.load(f, Loader=yaml.FullLoader)
    return data


def write_yaml(data, file_path):
    with open(file_path, 'w') as f:
        yaml.dump(data, f, default_flow_style=False)


def set_list_id(x, id_table):
    if x is not np.nan and type(x) is not float and x is not None:
        ids = []
        for i in x:
            i = i.lower().replace(' ', '_').strip()
            if i in list(id_table.keys()):
                ids.append(id_table[i])
        return ids
    else:
        return np.nan


def n_nulls(df):
    if isinstance(df, pd.DataFrame):
        nulls = df.isnull().sum().sum()
        print(nulls, f' - {round(nulls/len(df)*100,2)}% null in dataframe')
    elif isinstance(df, pd.Series):
        nulls = df.isnull().sum()
        print(nulls, f' - {round(nulls/len(df)*100,2)}% null in series')
    else:
        print('Not a dataframe or series')


def n_dupes(df):
    print(df.duplicated().sum())


def has_numbers(inputString):
    return any(char.isdigit() for char in inputString)


def find_percentages(inputString):
    percentages = re.findall(
        '(?<=\d)[.]\d{1,2}%|100%|\d{1,2}%', inputString, re.IGNORECASE)
    return percentages if len(percentages) > 0 else None


def find_numbers(inputString):
    numbers = re.findall('\d{1,2}.\d{1,2}', inputString)
    return numbers if len(numbers) > 0 else None


def find_positions(pattern, string):
    positions = [match.span() for match in re.finditer(pattern, string)]
    return positions if len(positions) > 0 else None


def is_present(pattern, text):
    return re.search(pattern, text) is not None


def get_number(text):
    match = re.search(r"(?<=[^\d\.])\d+(\.\d+)?(?=[^\d\.])", text)
    return int(match.group()) if match else None


def split_string_on_consecutive_newlines(string, n):
    return re.split(r'\n{3,}', string)


def scrub_cosing(text):
    cosing_data = {}

    cosing_id = np.nan
    name = np.nan
    num = np.nan
    functions = np.nan

    re_cosing = re.search("CosIng ID:", text)
    re_name = re.search("Name:", text)

    if re_cosing is not None and re_name is not None:
        cosing_data['id'] = text[re_cosing.end():re_name.start()].strip()
    else:
        cosing_data['id'] = np.nan

    re_num = re.search("#:", text)
    if re_name is not None and re_num is not None:
        name = text[re_name.end():re_num.start()].strip()
        if 'Name:' in name:
            name = name.split('Name:')[1].strip()
        cosing_data['name'] = name
    else:
        cosing_data['name'] = np.nan

    re_function = re.search("Functions:", text)
    if re_function is not None and re_num is not None:
        cosing_data['num'] = text[re_num.end():re_function.start()].strip()
    else:
        cosing_data['num'] = np.nan

    if re_function is not None:
        cosing_data['functions'] = [f.strip()
                                    for f in text[re_function.end():].split(',')]
    else:
        cosing_data['functions'] = np.nan

    return cosing_data


def get_files(directory, file_type):
    return glob.glob(directory + '/*.' + file_type)


def all_nans(df: pd.DataFrame):
    return round(df.isnull().sum().sum()/df.size*100, 2)


def col_nans(df: pd.DataFrame):
    return round(df.isnull().sum()/len(df)*100, 2)


def col_duplicates(df, column_name):
    """
    Returns the total number of duplicates in the specified column of a DataFrame.

    Args:
        df (pd.DataFrame): The input DataFrame.
        column_name (str): The name of the column to count duplicates in.

    Returns:
        int: The total number of duplicates in the specified column.
    """
    duplicates = df[column_name].duplicated(keep='first').sum()
    return duplicates


def invert(d: dict):
    return {v: k for k, v in d.items()} if d is not np.nan or d is not None else np.nan
