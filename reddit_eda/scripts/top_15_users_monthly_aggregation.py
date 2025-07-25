import os
import json
from collections import Counter, defaultdict
import datetime
import csv

BASE_DIR = os.path.join(os.path.dirname(__file__), '../database/')
ANALYSIS_DIR = os.path.join(os.path.dirname(__file__), '../analysis/')
subreddits = ["AnorexiaNervosa", "ARFID", "bulimia", "EatingDisorders", "fuckeatingdisorders"]
ignore_users = {"AutoModerator", "EDPostRequests", "AnorexiaNervosa-ModTeam", "fuckeatingdisorders-ModTeam"}

now = datetime.datetime.utcnow()
five_years_ago = now - datetime.timedelta(days=5*365)

def month_label(dt):
    return f"{dt.year}-{dt.month:02d}"

# 1. Count posts+comments per user in last 5 years, and collect their monthly data
total_counts = Counter()
user_month_data = defaultdict(lambda: defaultdict(lambda: {"post_count": 0, "comment_count": 0, "texts": []}))

for subreddit in subreddits:
    sub_dir = os.path.join(BASE_DIR, subreddit)
    if not os.path.isdir(sub_dir):
        continue
    for fname in os.listdir(sub_dir):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(sub_dir, fname), "r") as f:
            data = json.load(f)
            # Post
            author = data.get("author")
            created_utc = data.get("created_utc")
            if author and author != "None" and author not in ignore_users and created_utc:
                dt = datetime.datetime.utcfromtimestamp(created_utc)
                if dt >= five_years_ago:
                    label = month_label(dt)
                    user_month_data[author][label]["post_count"] += 1
                    user_month_data[author][label]["texts"].append(data.get("selftext", ""))
                    total_counts[author] += 1
            # Comments
            for comment in data.get("comments", []):
                c_author = comment.get("author")
                c_created_utc = comment.get("created_utc")
                if c_author and c_author != "None" and c_author not in ignore_users and c_created_utc:
                    dt = datetime.datetime.utcfromtimestamp(c_created_utc)
                    if dt >= five_years_ago:
                        label = month_label(dt)
                        user_month_data[c_author][label]["comment_count"] += 1
                        user_month_data[c_author][label]["texts"].append(comment.get("body", ""))
                        total_counts[c_author] += 1

# 2. Get top 15 users by total posts+comments
top_users = [user for user, _ in total_counts.most_common(15)]

# 3. Aggregate stats for each user/month
all_months = set()
for user in top_users:
    all_months.update(user_month_data[user].keys())
all_months = sorted(all_months)

os.makedirs(ANALYSIS_DIR, exist_ok=True)
csv_path = os.path.join(ANALYSIS_DIR, "top_15_users_monthly_aggregation.csv")
with open(csv_path, "w", newline='', encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["user", "month", "post_count", "comment_count", "total_count", "total_words", "avg_text_length"])
    for user in top_users:
        for month in all_months:
            data = user_month_data[user][month]
            texts = [t for t in data["texts"] if t]
            total_words = sum(len(t.split()) for t in texts)
            avg_text_length = (sum(len(t) for t in texts) / len(texts)) if texts else 0
            writer.writerow([
                user, month, data["post_count"], data["comment_count"],
                data["post_count"] + data["comment_count"], total_words, f"{avg_text_length:.1f}"
            ])
print(f"Saved monthly aggregation for top 15 users to {csv_path}") 