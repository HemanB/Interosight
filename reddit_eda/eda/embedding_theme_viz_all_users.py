import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import glob
from sentence_transformers import SentenceTransformer
import umap
import hdbscan
from tqdm import tqdm

MODEL_NAME = 'sentence-transformers/all-mpnet-base-v2'


def load_all_timelines(user_histories_dir):
    dfs = []
    for path in glob.glob(os.path.join(user_histories_dir, '*_full_timeline.jsonl')):
        user = os.path.basename(path).split('_full_timeline')[0]
        df = pd.read_json(path, lines=True)
        df['datetime'] = pd.to_datetime(df['datetime'])
        df['user'] = user
        dfs.append(df)
    all_df = pd.concat(dfs, ignore_index=True)
    return all_df


def compute_embeddings(texts, model_name=MODEL_NAME):
    model = SentenceTransformer(model_name)
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=32)
    return embeddings


def reduce_umap(embeddings, n_neighbors=15, min_dist=0.1, n_components=2, random_state=42):
    reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, n_components=n_components, random_state=random_state)
    embedding_2d = reducer.fit_transform(embeddings)
    return embedding_2d


def cluster_hdbscan(embeddings):
    clusterer = hdbscan.HDBSCAN(min_cluster_size=800, prediction_data=True)
    labels = clusterer.fit_predict(embeddings)
    return labels


def plot_umap_clusters(embedding_2d, labels, users, outdir):
    # Plot by cluster
    plt.figure(figsize=(12, 10))
    palette = sns.color_palette('tab20', np.unique(labels).max() + 1)
    colors = [palette[label] if label >= 0 else (0.7, 0.7, 0.7) for label in labels]
    plt.scatter(embedding_2d[:, 0], embedding_2d[:, 1], c=colors, s=10, alpha=0.7)
    plt.title('All Users - UMAP Embedding with HDBSCAN Clusters')
    plt.xlabel('UMAP-1')
    plt.ylabel('UMAP-2')
    plt.tight_layout()
    plt.savefig(os.path.join(outdir, 'all_users_umap_hdbscan_clusters.png'))
    plt.close()
    # Plot by user
    plt.figure(figsize=(12, 10))
    unique_users = sorted(set(users))
    user_palette = sns.color_palette('husl', len(unique_users))
    user_color_map = {u: user_palette[i] for i, u in enumerate(unique_users)}
    user_colors = [user_color_map[u] for u in users]
    plt.scatter(embedding_2d[:, 0], embedding_2d[:, 1], c=user_colors, s=10, alpha=0.7)
    plt.title('All Users - UMAP Embedding Colored by User')
    plt.xlabel('UMAP-1')
    plt.ylabel('UMAP-2')
    plt.tight_layout()
    plt.savefig(os.path.join(outdir, 'all_users_umap_by_user.png'))
    plt.close()


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Embedding-based theme visualization for ALL Reddit users')
    parser.add_argument('--user_histories_dir', required=True, help='Directory with *_full_timeline.jsonl files')
    parser.add_argument('--outdir', default='.', help='Directory to save outputs')
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    print('Loading all user timelines...')
    df = load_all_timelines(args.user_histories_dir)
    texts = df['text'].astype(str).tolist()

    print('Computing embeddings...')
    embeddings = compute_embeddings(texts)
    np.save(os.path.join(args.outdir, 'all_users_embeddings.npy'), embeddings)

    print('Reducing dimensionality with UMAP...')
    embedding_2d = reduce_umap(embeddings)
    np.save(os.path.join(args.outdir, 'all_users_umap2d.npy'), embedding_2d)

    print('Clustering with HDBSCAN...')
    labels = cluster_hdbscan(embedding_2d)
    df['cluster'] = labels
    df['umap_x'] = embedding_2d[:, 0]
    df['umap_y'] = embedding_2d[:, 1]
    df.to_csv(os.path.join(args.outdir, 'all_users_with_clusters.csv'), index=False)

    print('Plotting UMAP clusters...')
    plot_umap_clusters(embedding_2d, labels, df['user'].tolist(), args.outdir)
    print(f'Done. Outputs saved to {args.outdir}')

if __name__ == '__main__':
    main() 