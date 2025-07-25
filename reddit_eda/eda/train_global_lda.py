import pandas as pd
import os
import glob
import json
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import joblib
import argparse


def load_all_user_texts(user_histories_dir):
    all_texts = []
    files = glob.glob(os.path.join(user_histories_dir, '*_full_timeline.jsonl'))
    for file in files:
        with open(file, 'r') as f:
            for line in f:
                try:
                    record = json.loads(line)
                    if 'text' in record:
                        all_texts.append(str(record['text']))
                except Exception as e:
                    print(f"Error reading line in {file}: {e}")
    return all_texts

def print_top_words(model, feature_names, n_top_words=10):
    topics = []
    for topic_idx, topic in enumerate(model.components_):
        top_words = [feature_names[i] for i in topic.argsort()[:-n_top_words - 1:-1]]
        topics.append(top_words)
    return topics

def main():
    parser = argparse.ArgumentParser(description='Train global LDA model on all user data')
    parser.add_argument('--user_histories_dir', required=True, help='Directory with *_full_timeline.jsonl files')
    parser.add_argument('--outdir', default='.', help='Directory to save model and outputs')
    parser.add_argument('--n_topics', type=int, default=8, help='Number of topics for LDA')
    parser.add_argument('--max_features', type=int, default=2000, help='Max features for CountVectorizer')
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    print('Loading all user texts...')
    all_texts = load_all_user_texts(args.user_histories_dir)
    print(f'Total documents: {len(all_texts)}')

    print('Vectorizing...')
    vectorizer = CountVectorizer(max_features=args.max_features, stop_words='english')
    X = vectorizer.fit_transform(all_texts)

    print('Training LDA...')
    lda = LatentDirichletAllocation(n_components=args.n_topics, random_state=42)
    lda.fit(X)

    print('Saving model and vectorizer...')
    joblib.dump(lda, os.path.join(args.outdir, 'global_lda_model.joblib'))
    joblib.dump(vectorizer, os.path.join(args.outdir, 'global_lda_vectorizer.joblib'))

    print('Saving top words per topic...')
    topics = print_top_words(lda, vectorizer.get_feature_names_out())
    with open(os.path.join(args.outdir, 'global_lda_topics.txt'), 'w') as f:
        for i, words in enumerate(topics):
            f.write(f'Topic {i}: {", ".join(words)}\n')
    print('Done.')

if __name__ == '__main__':
    main() 