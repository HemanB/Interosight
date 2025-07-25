import numpy as np
import hdbscan
import matplotlib.pyplot as plt
import pandas as pd
import os
import argparse

def count_clusters(labels):
    return len(set(labels)) - (1 if -1 in labels else 0)

def main():
    parser = argparse.ArgumentParser(description='Plot HDBSCAN cluster count vs min_cluster_size')
    parser.add_argument('--embeddings', required=True, help='Path to all_users_embeddings.npy')
    parser.add_argument('--outdir', default='.', help='Directory to save outputs')
    parser.add_argument('--min', type=int, default=10, help='Minimum min_cluster_size')
    parser.add_argument('--max', type=int, default=800, help='Maximum min_cluster_size')
    parser.add_argument('--step', type=int, default=25, help='Step size for min_cluster_size')
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    embeddings = np.load(args.embeddings)
    min_sizes = list(range(args.min, args.max + 1, args.step))
    results = []
    for min_size in min_sizes:
        clusterer = hdbscan.HDBSCAN(min_cluster_size=min_size, prediction_data=True)
        labels = clusterer.fit_predict(embeddings)
        n_clusters = count_clusters(labels)
        results.append({'min_cluster_size': min_size, 'n_clusters': n_clusters})
        print(f"min_cluster_size={min_size}: n_clusters={n_clusters}")
    df = pd.DataFrame(results)
    df.to_csv(os.path.join(args.outdir, 'hdbscan_cluster_counts_vs_min_size.csv'), index=False)
    plt.figure(figsize=(8, 5))
    plt.plot(df['min_cluster_size'], df['n_clusters'], marker='o')
    plt.xlabel('min_cluster_size')
    plt.ylabel('Number of clusters (excluding noise)')
    plt.title('HDBSCAN: Number of clusters vs min_cluster_size')
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(os.path.join(args.outdir, 'hdbscan_cluster_counts_vs_min_size.png'))
    plt.close()
    print(f"Done. Outputs saved to {args.outdir}")

if __name__ == '__main__':
    main() 