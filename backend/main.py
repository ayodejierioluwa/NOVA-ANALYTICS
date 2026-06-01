import os
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from agent import execute_query

app = FastAPI(title="Nova Analytics API")

# Strict CORS policy for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class QueryRequest(BaseModel):
    file_id: str
    query: str

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Validate extension
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    # Generate unique ID
    file_id = str(uuid.uuid4())
    secure_filename = f"{file_id}.csv"
    file_path = os.path.join(UPLOAD_DIR, secure_filename)
    
    try:
        # Save file securely
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Read a small sample to infer columns for the frontend
        df = pd.read_csv(file_path, nrows=5)
        columns = df.columns.tolist()
        
        return {"file_id": file_id, "columns": columns, "message": "File uploaded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/query")
async def query_data(request: QueryRequest):
    file_path = os.path.join(UPLOAD_DIR, f"{request.file_id}.csv")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Dataset not found. Please upload again.")
    
    try:
        # Process the query through the LLM agent
        result = execute_query(file_path, request.query)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": "Failed to process query securely."}

if __name__ == "__main__":
    import uvicorn
    # MUST listen on localhost or 127.0.0.1 when testing for security
    uvicorn.run(app, host="127.0.0.1", port=8000)
