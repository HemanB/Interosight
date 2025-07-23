import os
import json
from collections import Counter, defaultdict
import matplotlib.pyplot as plt
import datetime
import numpy as np

# Path to the database directory
BASE_DIR = os.path.join(os.path.dirname(__file__), '../database/')
ANALYSIS_DIR = os.path.join(os.path.dirname(__file__), '../analysis/')
subreddits = ["AnorexiaNervosa", "ARFID", "bulimia", "EatingDisorders", "fuckeatingdisorders"]
ignore_users = {"AutoModerator", "EDPostRequests", "AnorexiaNervosa-ModTeam", "fuckeatingdisorders-ModTeam"}

user_counts = Counter()
user_timestamps = defaultdict(list)

# Collect all timestamps for each user
for subreddit in subreddits:
    sub_dir = os.path.join(BASE_DIR, subreddit)
    if not os.path.isdir(sub_dir):
        continue
    for fname in os.listdir(sub_dir):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(sub_dir, fname), "r") as f:
            data = json.load(f)
            # Post author
            author = data.get("author")
            created_utc = data.get("created_utc")
            if author and author != "None" and author not in ignore_users and created_utc:
                user_counts[author] += 1
                user_timestamps[author].append(created_utc)
            # Comment authors
            for comment in data.get("comments", []):
                c_author = comment.get("author")
                c_created_utc = comment.get("created_utc")
                if c_author and c_author != "None" and c_author not in ignore_users and c_created_utc:
                    user_counts[c_author] += 1
                    user_timestamps[c_author].append(c_created_utc)

# Get top 15 users
if user_counts:
    top_users = [user for user, _ in user_counts.most_common(15)]
    # Prepare time bins (monthly for 5 years)
    now = datetime.datetime.utcnow()
    start = now - datetime.timedelta(days=5*365)
    months = [(start.year + (start.month + i) // 12, (start.month + i) % 12 + 1) for i in range(60)]
    month_labels = [f"{y}-{m:02d}" for y, m in months]
    month_to_idx = {label: idx for idx, label in enumerate(month_labels)}

    # Aggregate counts per month for each user
    user_month_counts = {user: np.zeros(len(month_labels), dtype=int) for user in top_users}
    for user in top_users:
        for ts in user_timestamps[user]:
            dt = datetime.datetime.utcfromtimestamp(ts)
            label = f"{dt.year}-{dt.month:02d}"
            if label in month_to_idx:
                user_month_counts[user][month_to_idx[label]] += 1

    # Plot
    os.makedirs(ANALYSIS_DIR, exist_ok=True)
    plt.figure(figsize=(20, 10))
    for user in top_users:
        plt.plot(month_labels, user_month_counts[user], label=user)
    plt.xticks(rotation=90)
    plt.xlabel("Month")
    plt.ylabel("Number of Posts + Comments")
    plt.title("Top 15 Reddit Users' Activity Over the Past 5 Years (All Subreddits)")
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(ANALYSIS_DIR, 'top_15_users_timeseries.png'))
    print(f"Saved time-series graph to {os.path.join(ANALYSIS_DIR, 'top_15_users_timeseries.png')}")
else:
    print("No user data found.") 