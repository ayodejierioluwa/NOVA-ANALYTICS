import os
import pandas as pd
from agent import execute_query

# Load the new key manually for the test
api_key = "AIzaSyAT6dMlVUf7l6j0oK7Mmn2BrkvcqWwnmzc"
os.environ["GEMINI_API_KEY"] = api_key

# We need to re-import or re-configure genai since the agent module might have loaded it empty
import google.generativeai as genai
genai.configure(api_key=api_key)

dummy_csv_path = "sales_mock.csv"
pd.DataFrame({
    "Region": ["North", "South", "North", "East", "West"],
    "Sales": [1000, 1500, 2000, 500, 3000],
    "Month": ["Jan", "Jan", "Feb", "Feb", "Mar"]
}).to_csv(dummy_csv_path, index=False)

def run_accuracy_tests():
    print("--- Running Phase 2: Agent Accuracy & Logic Tests ---")
    
    test_queries = [
        ("What is the total sales amount?", "single_value"),
        ("Show me sales by region as a bar chart.", "chart"),
        ("What are the top 2 regions by sales?", "table")
    ]
    
    passed = 0
    
    for query, expected_format in test_queries:
        print(f"\n[Test] Query: '{query}'")
        result = execute_query(dummy_csv_path, query)
        
        if "error" in result:
            print(f"❌ Failed: Error executing query: {result['error']}")
            continue
            
        if expected_format == "single_value" and "value" in result:
            print(f"✅ Passed: Correctly returned a single value -> {result}")
            passed += 1
        elif expected_format == "chart" and "chart_type" in result:
            print(f"✅ Passed: Correctly returned a chart config -> {result}")
            passed += 1
        elif expected_format == "table" and isinstance(result, list):
            print(f"✅ Passed: Correctly returned a table format -> {result}")
            passed += 1
        else:
            print(f"❌ Failed: Unexpected format returned. Expected {expected_format}, got {result}")
            
    print(f"\n--- Accuracy Test Summary: {passed}/{len(test_queries)} passed ---")
    
    if os.path.exists(dummy_csv_path):
        os.remove(dummy_csv_path)

if __name__ == "__main__":
    run_accuracy_tests()
