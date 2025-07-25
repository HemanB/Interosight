import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import argparse
from sentence_transformers import SentenceTransformer
import umap
import hdbscan
from tqdm import tqdm

MODEL_NAME = 'sentence-transformers/all-mpnet-base-v2'


def load_timeline(jsonl_path):
    df = pd.read_json(jsonl_path, lines=True)
    df['datetime'] = pd.to_datetime(df['datetime'])
    return df


def compute_embeddings(texts, model_name=MODEL_NAME):
    model = SentenceTransformer(model_name)
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=32)
    return embeddings


def reduce_umap(embeddings, n_neighbors=15, min_dist=0.1, n_components=2, random_state=42):
    reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, n_components=n_components, random_state=random_state)
    embedding_2d = reducer.fit_transform(embeddings)
    return embedding_2d


def cluster_hdbscan(embeddings):
    clusterer = hdbscan.HDBSCAN(min_cluster_size=10, prediction_data=True)
    labels = clusterer.fit_predict(embeddings)
    return labels


def plot_umap_clusters(embedding_2d, labels, outdir, user):
    plt.figure(figsize=(10, 8))
    palette = sns.color_palette('tab20', np.unique(labels).max() + 1)
    colors = [palette[label] if label >= 0 else (0.7, 0.7, 0.7) for label in labels]
    plt.scatter(embedding_2d[:, 0], embedding_2d[:, 1], c=colors, s=15, alpha=0.7)
    plt.title(f'{user} - UMAP Embedding with HDBSCAN Clusters')
    plt.xlabel('UMAP-1')
    plt.ylabel('UMAP-2')
    plt.tight_layout()
    plt.savefig(os.path.join(outdir, f'{user}_umap_hdbscan_clusters.png'))
    plt.close()


def main():
    parser = argparse.ArgumentParser(description='Embedding-based theme visualization for Reddit user timeline')
    parser.add_argument('--input', required=True, help='Path to user JSONL timeline')
    parser.add_argument('--outdir', default='.', help='Directory to save outputs')
    parser.add_argument('--user', default='Sareeee48', help='User name for labeling outputs')
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    df = load_timeline(args.input)
    texts = df['text'].astype(str).tolist()

    print('Computing embeddings...')
    embeddings = compute_embeddings(texts)
    np.save(os.path.join(args.outdir, f'{args.user}_embeddings.npy'), embeddings)

    print('Reducing dimensionality with UMAP...')
    embedding_2d = reduce_umap(embeddings)
    np.save(os.path.join(args.outdir, f'{args.user}_umap2d.npy'), embedding_2d)

    print('Clustering with HDBSCAN...')
    labels = cluster_hdbscan(embedding_2d)
    df['cluster'] = labels
    df.to_csv(os.path.join(args.outdir, f'{args.user}_with_clusters.csv'), index=False)

    print('Plotting UMAP clusters...')
    plot_umap_clusters(embedding_2d, labels, args.outdir, args.user)
    print(f'Done. Outputs saved to {args.outdir}')

if __name__ == '__main__':
    main() 