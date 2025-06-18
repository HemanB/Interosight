#!/usr/bin/env python3
# src/inspect_data.py

from datasets import load_from_disk
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def main():
    # 1) Load the processed Dataverse dataset
    print("Loading dataset...")
    ds = load_from_disk("data/merged_dataverse")
    
    # 2) Convert to pandas DataFrame
    df = ds.to_pandas()
    
    # 3) Print basic info
    print(f"\nDataset shape: {df.shape}")
    print("\nDataset Columns:")
    print(df.columns.tolist())
    
    # 4) Display the first 5 rows
    print("\nFirst 5 rows:")
    print(df.head())
    
    # 5) Analyze topic distributions by model
    print("\nAnalyzing topic distributions...")
    topic_cols = [col for col in df.columns if col not in ['id', 'text']]
    
    # Group columns by model
    model_cols = {}
    for col in topic_cols:
        model = col.split('_')[0]
        if model not in model_cols:
            model_cols[model] = []
        model_cols[model].append(col)
    
    # Print summary for each model
    for model, cols in model_cols.items():
        print(f"\n{model} topic statistics:")
        stats = df[cols].describe()
        print(stats)
    
    # 6) Visualize topic distributions for one model (e.g., gpt4o)
    print("\nCreating visualization...")
    model = 'gpt4o'
    if model in model_cols:
        plt.figure(figsize=(15, 6))
        df[model_cols[model]].boxplot()
        plt.xticks(rotation=45, ha='right')
        plt.title(f'{model} Topic Score Distributions')
        plt.tight_layout()
        plt.savefig('topic_distributions.png')
        print("Success: Saved visualization to topic_distributions.png")
    
    # 7) Sample some example posts
    print("\nSampling example posts...")
    sample = df.sample(3)
    for _, row in sample.iterrows():
        print(f"\nPost ID: {row['id']}")
        print(f"Text: {row['text'][:200]}...")
        print("\nTopic scores:")
        for col in topic_cols:
            if row[col] > 0:  # Only show non-zero scores
                print(f"{col}: {row[col]:.2f}")

if __name__ == "__main__":
    main() 