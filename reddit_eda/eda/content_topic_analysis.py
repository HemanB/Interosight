import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import json
import argparse
import os
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from collections import Counter
import joblib

# Optional: BERTopic
try:
    from bertopic import BERTopic
    BER_TOPIC_AVAILABLE = True
except ImportError:
    BER_TOPIC_AVAILABLE = False

def load_user_timeline(jsonl_path):
    records = []
    with open(jsonl_path, 'r') as f:
        for line in f:
            records.append(json.loads(line))
    df = pd.DataFrame(records)
    df['datetime'] = pd.to_datetime(df['datetime'])
    return df

def plot_subreddit_distribution(df, outdir, user):
    plt.figure(figsize=(10, 6))
    order = df['subreddit'].value_counts().index
    sns.countplot(data=df, y='subreddit', order=order)
    plt.title(f'{user} Subreddit Distribution')
    plt.xlabel('Number of Posts/Comments')
    plt.ylabel('Subreddit')
    plt.tight_layout()
    outpath = os.path.join(outdir, f'{user}_subreddit_distribution.png')
    plt.savefig(outpath)
    plt.close()
    df['subreddit'].value_counts().to_csv(os.path.join(outdir, f'{user}_subreddit_counts.csv'))

def run_lda(df, n_topics=8, max_features=2000):
    texts = df['text'].astype(str).tolist()
    vectorizer = CountVectorizer(max_features=max_features, stop_words='english')
    X = vectorizer.fit_transform(texts)
    lda = LatentDirichletAllocation(n_components=n_topics, random_state=42)
    lda.fit(X)
    return lda, vectorizer, X

def print_top_words(model, feature_names, n_top_words=10):
    topics = []
    for topic_idx, topic in enumerate(model.components_):
        top_words = [feature_names[i] for i in topic.argsort()[:-n_top_words - 1:-1]]
        topics.append(top_words)
    return topics

def plot_topic_evolution(df, topic_assignments, n_topics, outdir, user):
    df = df.copy()
    df['topic'] = topic_assignments
    df['month'] = df['datetime'].dt.to_period('M').astype(str)
    topic_counts = df.groupby(['month', 'topic']).size().unstack(fill_value=0)
    topic_counts.plot(kind='line', marker='o', figsize=(14, 7))
    plt.title(f'{user} Topic Evolution Over Time (LDA)')
    plt.xlabel('Month')
    plt.ylabel('Number of Posts/Comments')
    plt.legend(title='Topic', bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    outpath = os.path.join(outdir, f'{user}_topic_evolution_lda.png')
    plt.savefig(outpath)
    plt.close()
    topic_counts.to_csv(os.path.join(outdir, f'{user}_topic_evolution_lda.csv'))

def main():
    parser = argparse.ArgumentParser(description='Content & Topic Analysis of Reddit User Timeline')
    parser.add_argument('--input', required=True, help='Path to user JSONL timeline')
    parser.add_argument('--outdir', default='.', help='Directory to save outputs')
    parser.add_argument('--n_topics', type=int, default=8, help='Number of topics for LDA')
    parser.add_argument('--global_lda_model', type=str, default=None, help='Path to pre-trained global LDA model (joblib)')
    parser.add_argument('--global_vectorizer', type=str, default=None, help='Path to pre-trained global vectorizer (joblib)')
    args = parser.parse_args()

    user = os.path.basename(args.input).split('_')[0]
    os.makedirs(args.outdir, exist_ok=True)

    df = load_user_timeline(args.input)

    # Subreddit distribution
    plot_subreddit_distribution(df, args.outdir, user)

    if args.global_lda_model and args.global_vectorizer:
        print('Using global LDA model and vectorizer...')
        lda = joblib.load(args.global_lda_model)
        vectorizer = joblib.load(args.global_vectorizer)
        X = vectorizer.transform(df['text'].astype(str).tolist())
        n_topics = lda.n_components
        # Assign topics to each entry
        topic_assignments = lda.transform(X).argmax(axis=1)
        plot_topic_evolution(df, topic_assignments, n_topics, args.outdir, user)
        # Save topic assignments for each entry
        df['global_lda_topic'] = topic_assignments
        df[['datetime', 'text', 'global_lda_topic']].to_csv(os.path.join(args.outdir, f'{user}_global_lda_topic_assignments.csv'), index=False)
    else:
        # LDA Topic Modeling (local)
        lda, vectorizer, X = run_lda(df, n_topics=args.n_topics)
        topics = print_top_words(lda, vectorizer.get_feature_names_out())
        with open(os.path.join(args.outdir, f'{user}_lda_topics.txt'), 'w') as f:
            for i, words in enumerate(topics):
                f.write(f'Topic {i}: {", ".join(words)}\n')
        # Assign topics to each entry
        topic_assignments = lda.transform(X).argmax(axis=1)
        plot_topic_evolution(df, topic_assignments, args.n_topics, args.outdir, user)
        df['lda_topic'] = topic_assignments
        df[['datetime', 'text', 'lda_topic']].to_csv(os.path.join(args.outdir, f'{user}_lda_topic_assignments.csv'), index=False)

    # Optional: BERTopic (unchanged)
    if BER_TOPIC_AVAILABLE:
        print('Running BERTopic...')
        topic_model = BERTopic(verbose=True)
        topics, _ = topic_model.fit_transform(df['text'].astype(str).tolist())
        df['bertopic'] = topics
        df['month'] = df['datetime'].dt.to_period('M').astype(str)
        bertopic_counts = df.groupby(['month', 'bertopic']).size().unstack(fill_value=0)
        bertopic_counts.plot(kind='line', marker='o', figsize=(14, 7))
        plt.title(f'{user} Topic Evolution Over Time (BERTopic)')
        plt.xlabel('Month')
        plt.ylabel('Number of Posts/Comments')
        plt.legend(title='Topic', bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.tight_layout()
        outpath = os.path.join(args.outdir, f'{user}_topic_evolution_bertopic.png')
        plt.savefig(outpath)
        plt.close()
        bertopic_counts.to_csv(os.path.join(args.outdir, f'{user}_topic_evolution_bertopic.csv'))

    print(f"Content & topic analysis complete. Outputs saved to {args.outdir}")

if __name__ == '__main__':
    main() 