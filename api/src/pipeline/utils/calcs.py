import pandas as df

def min_max_normalization(df, column):
    min_value = df[column].min()
    max_value = df[column].max()
    df[column] = (df[column] - min_value) / (max_value - min_value)
    return df