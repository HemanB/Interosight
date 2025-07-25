import pandas as pd
import os
import argparse
from collections import Counter
import re
import nltk
nltk.download('stopwords')
from nltk.corpus import stopwords

STOPWORDS = set(stopwords.words('english'))
WORD_RE = re.compile(r"\b\w+\b")


def get_top_terms(texts, n=20):
    words = []
    for text in texts:
        tokens = WORD_RE.findall(str(text).lower())
        words.extend([w for w in tokens if w not in STOPWORDS and len(w) > 2])
    counter = Counter(words)
    return [w for w, _ in counter.most_common(n)]


def main():
    parser = argparse.ArgumentParser(description='Summarize top terms for each HDBSCAN cluster')
    parser.add_argument('--input', required=True, help='Path to all_users_with_clusters.csv')
    parser.add_argument('--outdir', default='.', help='Directory to save outputs')
    parser.add_argument('--topn', type=int, default=20, help='Number of top terms per cluster')
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    df = pd.read_csv(args.input)

    summaries = []
    for cluster in sorted(df['cluster'].unique()):
        if cluster == -1:
            continue  # skip noise
        cluster_df = df[df['cluster'] == cluster]
        top_terms = get_top_terms(cluster_df['text'], n=args.topn)
        summaries.append({
            'cluster': cluster,
            'size': len(cluster_df),
            'top_terms': ', '.join(top_terms)
        })

    summary_df = pd.DataFrame(summaries)
    summary_df.to_csv(os.path.join(args.outdir, 'cluster_top_terms.csv'), index=False)
    with open(os.path.join(args.outdir, 'cluster_top_terms.txt'), 'w') as f:
        for row in summaries:
            f.write(f"Cluster {row['cluster']} (n={row['size']}):\n  {row['top_terms']}\n\n")
    print(f"Done. Outputs saved to {args.outdir}")

if __name__ == '__main__':
    main() 