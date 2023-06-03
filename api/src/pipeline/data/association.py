import requests
import pandas as pd
from datasets import Dataset
import logging


class GWASCatalog(Dataset):
    BASE_URL = "https://www.ebi.ac.uk/gwas/rest/api"

    def __init__(self):
        pass

    def make_api_call(self, endpoint, params=None):
        url = f"{self.BASE_URL}/{endpoint}"
        try:
            response = requests.get(url, params=params)
            if response.status_code == 200:
                return pd.DataFrame.from_records(response.json())
            else:
                print(
                    f"Error: API request failed with status code {response.status_code}")
                print(response.text)
                return None
        except requests.exceptions.RequestException as e:
            logging.error('ahhhh')
            # print(f"Error: Request failed due to {e}")
            return None

    def get_studies(self, params=None):
        return self.make_api_call("studies", params)

    def get_associations(self, params=None):
        return self.make_api_call("associations", params)

    def get_traits(self, params=None):
        return self.make_api_call("efoTraits", params)


# Example usage:
gwas_catalog = GWASCatalog()

# Get studies with optional parameters as a DataFrame
studies_params = {"pageSize": 5, "page": 1}
studies = gwas_catalog.get_studies(params=studies_params)
print("Studies:")
print(studies)

# Get associations with optional parameters as a DataFrame
associations_params = {"pageSize": 5, "page": 1}
associations = gwas_catalog.get_associations(params=associations_params)
print("Associations:")
print(associations)

# Get traits with optional parameters as a DataFrame
traits_params = {"pageSize": 5, "page": 1}
traits = gwas_catalog.get_traits(params=traits_params)
print("Traits:")
print(traits)
