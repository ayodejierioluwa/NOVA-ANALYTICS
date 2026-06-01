import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))
from agent import execute_query

api_key = "AIzaSyCIkBbRQWe9eyjAIMHpc9chUQ_YMsq0ZzU"
os.environ["GEMINI_API_KEY"] = api_key

import google.generativeai as genai
genai.configure(api_key=api_key)

file_path = "/Users/macbook/.gemini/antigravity-ide/scratch/nova_analytics/rigorous_test_dataset.csv"
query = "what is the average net profit?"
result = execute_query(file_path, query)

print("RESULT:", result)
print("TYPE:", type(result))
if isinstance(result, dict):
    for k, v in result.items():
        print(f"Key {k} -> Type: {type(v)}")
