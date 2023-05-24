from fastapi import FastAPI, File, UploadFile
from typing import Optional
from pydantic import BaseModel

from pipeline.snp_processing import SampleConditionRisks
from pipeline.snp_product_filtering import ProductSNPFilter
from pipeline.snp_pipeline import SNP_Pipeline

app = FastAPI()


class SNPRequest(BaseModel):
    snp_pipeline: Optional[bool] = None
    file: Optional[UploadFile] = None


@app.post("/api/run_snp_pipeline")
async def run_snp_pipeline(request: SNPRequest):
    if request.snp_pipeline:
        if request.file:
            file_content = (await request.file.read()).decode("utf-8")
        else:
            test_job_config = "/Users/greysonnewton/Library/CloudStorage/OneDrive-Personal/CNTX/cosneti/test_user_job.yml"

        pipeline_config = "/Users/greysonnewton/Library/CloudStorage/OneDrive-Personal/CNTX/cosneti/pipeline.yml"
        pipeline = SNP_Pipeline(pipeline_config)
        pipeline.run_job(test_job_config)
        return {
            "result": {
                "products": pipeline.products.to_json(orient='records'),
                "snp_condition_risks": pipeline.condition_risk_table.drop_duplicates().to_json(orient='records'),
                "snp_input": pipeline.input_sample.to_json(orient='records'),
                "pipeline_history": pipeline.history,
            }
        }

    return {"result": "SNP pipeline not run"}


@app.post("/api/get_dataframe")
async def get_dataframe():
    # ... your code to create the DataFrame
    json_string = df.to_json(orient='records')
    return {"result": json_string}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app_fastapi:app", host="127.0.0.1",
                port=8000, log_level="info")
