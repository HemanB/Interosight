import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import json
from datetime import datetime
import argparse
import os


def load_user_timeline(jsonl_path):
    records = []
    with open(jsonl_path, 'r') as f:
        for line in f:
            records.append(json.loads(line))
    df = pd.DataFrame(records)
    df['datetime'] = pd.to_datetime(df['datetime'])
    return df


def plot_activity_over_time(df, freq, outdir, user):
    df = df.copy()
    df['period'] = df['datetime'].dt.to_period(freq)
    activity = df.groupby('period').size().reset_index(name='count')
    activity['period'] = activity['period'].astype(str)  # Convert Period to string for plotting
    plt.figure(figsize=(12, 6))
    sns.lineplot(data=activity, x='period', y='count', marker='o')
    plt.title(f'{user} Activity Frequency ({freq})')
    plt.xlabel(freq.capitalize())
    plt.ylabel('Number of Posts/Comments')
    plt.xticks(rotation=45)
    plt.tight_layout()
    outpath = os.path.join(outdir, f'{user}_activity_{freq}.png')
    plt.savefig(outpath)
    plt.close()
    return activity


def compute_time_gaps(df):
    df = df.sort_values('datetime')
    df['delta'] = df['datetime'].diff().dt.total_seconds() / 3600  # hours
    return df['delta'].describe(), df['delta']


def main():
    parser = argparse.ArgumentParser(description='Temporal Analysis of Reddit User Timeline')
    parser.add_argument('--input', required=True, help='Path to user JSONL timeline')
    parser.add_argument('--outdir', default='.', help='Directory to save outputs')
    args = parser.parse_args()

    user = os.path.basename(args.input).split('_')[0]
    os.makedirs(args.outdir, exist_ok=True)

    df = load_user_timeline(args.input)

    # Plot weekly and monthly activity
    weekly = plot_activity_over_time(df, 'W', args.outdir, user)
    monthly = plot_activity_over_time(df, 'M', args.outdir, user)

    # Compute time gaps and average interval
    delta_stats, deltas = compute_time_gaps(df)
    delta_stats.to_csv(os.path.join(args.outdir, f'{user}_time_gap_stats.csv'))
    deltas.to_csv(os.path.join(args.outdir, f'{user}_all_time_gaps.csv'), index=False)

    # Identify periods of increased activity (top 5 weeks/months)
    top_weeks = weekly.sort_values('count', ascending=False).head(5)
    top_months = monthly.sort_values('count', ascending=False).head(5)
    top_weeks.to_csv(os.path.join(args.outdir, f'{user}_top5_weeks.csv'), index=False)
    top_months.to_csv(os.path.join(args.outdir, f'{user}_top5_months.csv'), index=False)

    print(f"Temporal analysis complete. Outputs saved to {args.outdir}")

if __name__ == '__main__':
    main() 