import pandas as pd

df = pd.read_json('../../shared/src/data.json')

print(df.to_string()) 