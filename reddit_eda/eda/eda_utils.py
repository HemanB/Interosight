import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import umap
import hdbscan
import matplotlib.pyplot as plt
import seaborn as sns
import glob
import os

MODEL_NAME = 'sentence-transformers/all-mpnet-base-v2'

# --- Data Loading ---
def load_timeline(jsonl_path):
    df = pd.read_json(jsonl_path, lines=True)
    df['datetime'] = pd.to_datetime(df['datetime'])
    return df

def load_all_timelines(user_histories_dir):
    dfs = []
    for path in glob.glob(os.path.join(user_histories_dir, '*_full_timeline.jsonl')):
        user = os.path.basename(path).split('_full_timeline')[0]
        df = load_timeline(path)
        df['user'] = user
        dfs.append(df)
    if dfs:
        return pd.concat(dfs, ignore_index=True)
    else:
        return pd.DataFrame()

# --- Embedding ---
def compute_embeddings(texts, model_name=MODEL_NAME, batch_size=32):
    model = SentenceTransformer(model_name)
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=batch_size)
    return embeddings

# --- UMAP ---
def reduce_umap(embeddings, n_neighbors=15, min_dist=0.1, n_components=2, random_state=42):
    reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, n_components=n_components, random_state=random_state)
    return reducer.fit_transform(embeddings)

# --- HDBSCAN ---
def cluster_hdbscan(embeddings, min_cluster_size=10):
    clusterer = hdbscan.HDBSCAN(min_cluster_size=min_cluster_size, prediction_data=True)
    return clusterer.fit_predict(embeddings)

# --- Plotting ---
def plot_umap_clusters(embedding_2d, labels, outpath, title='UMAP Embedding with HDBSCAN Clusters'):
    plt.figure(figsize=(10, 8))
    palette = sns.color_palette('tab20', np.unique(labels).max() + 1)
    colors = [palette[label] if label >= 0 else (0.7, 0.7, 0.7) for label in labels]
    plt.scatter(embedding_2d[:, 0], embedding_2d[:, 1], c=colors, s=15, alpha=0.7)
    plt.title(title)
    plt.xlabel('UMAP-1')
    plt.ylabel('UMAP-2')
    plt.tight_layout()
    plt.savefig(outpath)
    plt.close() 