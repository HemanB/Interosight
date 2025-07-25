import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import json
import argparse
import os
from edeq_subscale_keywords import EDEQ_KEYWORDS
from collections import defaultdict

def load_user_timeline(jsonl_path):
    records = []
    with open(jsonl_path, 'r') as f:
        for line in f:
            records.append(json.loads(line))
    df = pd.DataFrame(records)
    df['datetime'] = pd.to_datetime(df['datetime'])
    return df

def score_entry(text, keywords):
    text_lower = text.lower()
    scores = {}
    for topic, kw_list in keywords.items():
        count = 0
        for kw in kw_list:
            if kw in text_lower:
                count += 1
        scores[topic] = count
    return scores

def analyze_user_edeq(df, outdir, user):
    # Score each entry
    topic_scores = [score_entry(str(row['text']), EDEQ_KEYWORDS) for _, row in df.iterrows()]
    topic_scores_df = pd.DataFrame(topic_scores)
    result_df = pd.concat([df[['datetime', 'text']], topic_scores_df], axis=1)
    result_df.to_csv(os.path.join(outdir, f'{user}_edeq_topic_scores.csv'), index=False)

    # Aggregate by month
    result_df['month'] = pd.to_datetime(result_df['datetime']).dt.to_period('M').astype(str)
    monthly = result_df.groupby('month')[list(EDEQ_KEYWORDS.keys())].sum().reset_index()
    monthly.to_csv(os.path.join(outdir, f'{user}_edeq_topic_monthly.csv'), index=False)

    # Plot topic trends over time
    plt.figure(figsize=(14, 7))
    for topic in EDEQ_KEYWORDS.keys():
        sns.lineplot(data=monthly, x='month', y=topic, marker='o', label=topic)
    plt.title(f'{user} EDE-Q Subscale Topic Trends Over Time')
    plt.xlabel('Month')
    plt.ylabel('Keyword Match Count')
    plt.xticks(rotation=45)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(outdir, f'{user}_edeq_topic_trends.png'))
    plt.close()

def main():
    parser = argparse.ArgumentParser(description='EDE-Q Subscale Topic Analysis for Reddit User Timeline')
    parser.add_argument('--input', required=True, help='Path to user JSONL timeline')
    parser.add_argument('--outdir', default='.', help='Directory to save outputs')
    args = parser.parse_args()

    user = os.path.basename(args.input).split('_')[0]
    os.makedirs(args.outdir, exist_ok=True)

    df = load_user_timeline(args.input)
    analyze_user_edeq(df, args.outdir, user)
    print(f'EDE-Q subscale topic analysis complete. Outputs saved to {args.outdir}')

if __name__ == '__main__':
    main() 