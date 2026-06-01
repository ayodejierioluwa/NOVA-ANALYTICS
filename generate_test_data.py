import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)

# Generate 500 rows of rigorous test data
n_rows = 500

# Create challenging columns
data = {
    "Transaction ID": [f"TXN-{i:04d}" for i in range(n_rows)],
    "Date of Sale": [(datetime(2023, 1, 1) + timedelta(days=np.random.randint(0, 365))).strftime("%Y-%m-%d") for _ in range(n_rows)],
    "Region/Zone": np.random.choice(["North America", "EMEA", "APAC", "LATAM", None], n_rows, p=[0.4, 0.3, 0.2, 0.05, 0.05]), # Includes Nulls
    "Product Category": np.random.choice(["Software", "Hardware", "Services", "Subscription"], n_rows),
    "Gross Revenue ($)": np.random.normal(loc=5000, scale=2000, size=n_rows).round(2), # Normal distribution
    "Discount Applied %": np.random.choice([0, 5, 10, 15, 20, np.nan], n_rows, p=[0.5, 0.2, 0.1, 0.1, 0.05, 0.05]), # Includes NaNs
    "Customer Satisfaction (1-10)": np.random.randint(1, 11, size=n_rows),
    "Is Enterprise?": np.random.choice(["Yes", "No", "Pending"], n_rows),
}

df = pd.DataFrame(data)

# Introduce some dirty data for rigorous testing
# 1. Negative revenue (anomalies)
df.loc[10:15, "Gross Revenue ($)"] = df.loc[10:15, "Gross Revenue ($)"] * -1
# 2. Extreme Outliers
df.loc[250, "Gross Revenue ($)"] = 1500000.00
# 3. Messy text strings
df.loc[100, "Region/Zone"] = "  N0rth Am3rica  " 

# Calculate net profit (with some missing discounts defaulting to 0)
discount = df["Discount Applied %"].fillna(0) / 100
df["Net Profit ($)"] = (df["Gross Revenue ($)"] * (1 - discount) * np.random.uniform(0.1, 0.4, n_rows)).round(2)

output_path = "/Users/macbook/.gemini/antigravity-ide/scratch/nova_analytics/rigorous_test_dataset.csv"
df.to_csv(output_path, index=False)
print(f"Dataset generated at {output_path}")
