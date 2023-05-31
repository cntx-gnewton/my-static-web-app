import pandas as pd
from ast import literal_eval

ing_path=r"C:\Users\greys\projects\azure-swa\my-static-web-app\api\src\external\ingredients\v1\ingredients.xlsx"
prd_path=r"C:\Users\greys\projects\azure-swa\my-static-web-app\api\src\external\products\v2\products.xlsx"

# Load your Excel file
ing_df = pd.read_excel(ing_path)
ing_df['name'] = ing_df['name'].apply(lambda x: str(x).lower().replace(" ","_"))

# Load your Excel file
prd_df = pd.read_excel(prd_path)

# TODO: Include alias into ingredient names
def apply_like_ratio(row):
    ings=literal_eval(row.ingredient_list)
    prd_ings=ing_df.loc[ing_df.name.isin(ings)]
    prd_ings=prd_ings.loc[prd_ings.dislikes >0]
    prd_ings["like_ratio"]=prd_ings.likes / (prd_ings.likes + prd_ings.dislikes)
    row["like_ratio"]=prd_ings.like_ratio.mean()
    return row

qant_list = prd_df.dropna(subset=["ingredient_list"]).apply(apply_like_ratio, axis=1)
qant_list.sort_values("like_ratio", ascending=False)
    
qant_list.shape
import pandas as pd
pd.options.plotting.backend = "plotly"

# Assuming df is your DataFrame and 'like_ratio' is your column of interest

qant_list['like_ratio'].plot(kind='hist', nbins=50, title='Like Ratio Histogram')


prd_df.type.unique()
import pandas as pd

pd.options.plotting.backend = "plotly"

# Assuming df is your DataFrame

for typ, group_df in qant_list.groupby('type'):
    fig = group_df['like_ratio'].plot(kind='hist', nbins=50, title=f'Like Ratio Histogram for Type: {typ}')
    fig.show()
