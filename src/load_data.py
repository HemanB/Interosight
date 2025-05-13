#!/usr/bin/env python3
# src/load_data.py

import os, zipfile
import pandas as pd
from datasets import Dataset

RAW_ZIP     = "data/raw/dataverse_files.zip"
RAW_DIR     = "data/raw/dataverse_files"
OUT_DIR     = "data/merged_dataverse"
MODEL_FILES = [
    "topic_gpt4o.csv.zip",
    "topic_Llama-3.1-8B-Instruct.csv.zip",
    "topic_Qwen2.5-7B-Instruct.csv.zip",
    "topic_Mistral-7B-Instruct-v0.3.csv.zip",
    "topic_Vicuna-7b-v1.5.csv.zip",
    "topic_ensemble.csv.zip",
    "topic_human.csv.zip",
]

def unzip_all():
    os.makedirs(RAW_DIR, exist_ok=True)
    with zipfile.ZipFile(RAW_ZIP, "r") as z:
        z.extractall(RAW_DIR)
    for fname in os.listdir(RAW_DIR):
        if fname.lower().endswith(".zip") and fname != os.path.basename(RAW_ZIP):
            path = os.path.join(RAW_DIR, fname)
            with zipfile.ZipFile(path, "r") as z:
                z.extractall(RAW_DIR)

def load_posts():
    # reddit_posts.csv was extracted from reddit_posts.csv.zip
    path = os.path.join(RAW_DIR, "reddit_posts.csv")
    df = pd.read_csv(path)                    # no compression here
    
    # Handle ID column name
    id_col = "sm_id" if "sm_id" in df.columns else "post_id" if "post_id" in df.columns else "id"
    if id_col != "id":
        df = df.rename(columns={id_col: "id"})
    
    # Handle text column
    if "body" in df.columns:
        df = df.rename(columns={"body": "text"})
    
    return df[["id", "text"]]

def load_key():
    # key.csv was extracted from key.csv.zip
    path = os.path.join(RAW_DIR, "key.csv")
    key_df = pd.read_csv(path)                # no compression here
    return dict(zip(key_df["sm_id"], key_df["sr_name"]))


def merge_topics(base: pd.DataFrame, id2name: dict) -> pd.DataFrame:
    df = base.set_index("id")
    for fname in MODEL_FILES:
        model = fname.replace("topic_", "").replace(".csv.zip", "")
        csv_name = fname.replace(".zip", "")
        path  = os.path.join(RAW_DIR, csv_name)
        tmp   = pd.read_csv(path)
        # Rename sm_id to id for joining
        if "sm_id" in tmp.columns:
            tmp = tmp.rename(columns={"sm_id": "id"})
        # Drop id column from topics to avoid duplicate join columns
        topic_cols = [col for col in tmp.columns if col != "id"]
        # Prefix topic columns with model name
        tmp = tmp.set_index("id")
        tmp = tmp.rename(columns={col: f"{model}_{col}" for col in topic_cols})
        df = df.join(tmp, how="left")
    return df.reset_index().fillna(0)

def main():
    print("🔽 Unzipping data…")
    unzip_all()
    print("✅ Loaded raw files into", RAW_DIR)

    print("🔽 Loading posts…")
    posts = load_posts()
    print("→", len(posts), "posts")

    print("🔽 Loading key…")
    id2name = load_key()

    print("🔽 Merging topic annotations…")
    merged = merge_topics(posts, id2name)
    print("→ merged shape:", merged.shape)

    print("🔽 Saving HF dataset…")
    os.makedirs(OUT_DIR, exist_ok=True)
    # Cast all columns except 'id' and 'text' to float if possible, otherwise to string
    for col in merged.columns:
        if col not in ["id", "text"]:
            try:
                merged[col] = merged[col].astype(float)
            except Exception:
                merged[col] = merged[col].astype(str)
    ds = Dataset.from_pandas(merged)
    ds.save_to_disk(OUT_DIR)
    print(f"✅ Saved {len(ds)} examples to {OUT_DIR}")

if __name__ == "__main__":
    main()
