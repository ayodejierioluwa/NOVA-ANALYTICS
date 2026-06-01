import os
import json
import pandas as pd
import google.generativeai as genai

def load_keys():
    """Loads all Gemini API keys from environment and the backend's local .env file."""
    keys = []
    
    # 1. Check system environment
    sys_key = os.environ.get("GEMINI_API_KEY", "")
    if sys_key:
        keys.append(sys_key)
        
    # 2. Parse local .env file
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip()
                    if k.startswith("GEMINI_API_KEY") and v:
                        if v not in keys:
                            keys.append(v)
        except Exception as e:
            print(f"Warning: Failed to read .env file: {e}")
            
    return keys

def execute_query(file_path: str, query: str):
    # 1. Load a sample of the data to get the schema
    try:
        df_sample = pd.read_csv(file_path, nrows=5)
    except Exception as e:
        return {"error": f"Could not read CSV: {str(e)}"}
    
    schema_info = df_sample.dtypes.to_string()
    columns_info = df_sample.columns.tolist()

    # 2. Construct the prompt for the LLM
    prompt = f"""
You are an expert data analyst AI. 
A user has uploaded a dataset and asked a question: "{query}"

Dataset schema:
{schema_info}

Columns: {columns_info}

Write ONLY valid Python code using pandas. 
The dataframe is already loaded in a variable named `df`.
You must store your final answer in a dictionary named `result_data`. 
If the user is asking for a summary or table, format `result_data` as a list of dictionaries.
If the user is asking for a single number, store it like {{"value": number}}.
If the user is asking for a chart, store it like {{"chart_type": "bar", "data": [{{...}}, {{...}}]}} where data is ready for Recharts.

DO NOT output markdown formatting like ```python. ONLY output the raw python code.
"""

    # 3. Get the code from Gemini (with automatic key rotation)
    keys = load_keys()
    if not keys:
        return {"error": "No GEMINI_API_KEY configured in system environment or .env file."}

    generated_code = ""
    last_error = None
    
    for idx, key in enumerate(keys):
        try:
            genai.configure(api_key=key)
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = model.generate_content(prompt)
            generated_code = response.text.strip()
            
            # If we got a valid response, break and proceed to execution
            if generated_code:
                # Clean code formatting if the LLM outputted code blocks
                if generated_code.startswith("```python"):
                    generated_code = generated_code[9:]
                if generated_code.endswith("```"):
                    generated_code = generated_code[:-3]
                generated_code = generated_code.strip()
                break
        except Exception as e:
            last_error = str(e)
            print(f"Warning: Gemini API Key {idx+1} failed. Error: {last_error}")
            continue
    else:
        return {"error": f"All configured Gemini API keys failed. Last error: {last_error}"}

    # 4. Safely execute the code
    df = pd.read_csv(file_path)
    
    # Restricted execution environment
    restricted_globals = {
        "pd": pd,
        "__builtins__": {}
    }
    restricted_locals = {
        "df": df,
        "result_data": {}
    }

    try:
        # Note: In a production environment with untrusted users, 
        # arbitrary code execution even with restricted globals is dangerous.
        # However, for this local prototype, it serves as the dynamic engine.
        exec(generated_code, restricted_globals, restricted_locals)
        return restricted_locals.get("result_data", {"error": "result_data was not populated."})
    except Exception as e:
        return {"error": f"Execution error: {str(e)}", "code": generated_code}
