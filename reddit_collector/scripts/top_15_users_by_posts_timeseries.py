import os
import json
from collections import Counter, defaultdict
import matplotlib.pyplot as plt
import datetime

BASE_DIR = os.path.join(os.path.dirname(__file__), '../database/')
ANALYSIS_DIR = os.path.join(os.path.dirname(__file__), '../analysis/')
subreddits = ["AnorexiaNervosa", "ARFID", "bulimia", "EatingDisorders", "fuckeatingdisorders"]
ignore_users = {"AutoModerator", "EDPostRequests", "AnorexiaNervosa-ModTeam", "fuckeatingdisorders-ModTeam"}

# Only consider posts from the last 5 years
now = datetime.datetime.utcnow()
five_years_ago = now - datetime.timedelta(days=5*365)

user_post_counts = Counter()
user_post_dates = defaultdict(list)

for subreddit in subreddits:
    sub_dir = os.path.join(BASE_DIR, subreddit)
    if not os.path.isdir(sub_dir):
        continue
    for fname in os.listdir(sub_dir):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(sub_dir, fname), "r") as f:
            data = json.load(f)
            author = data.get("author")
            created_utc = data.get("created_utc")
            if author and author != "None" and author not in ignore_users and created_utc:
                dt = datetime.datetime.utcfromtimestamp(created_utc)
                if dt >= five_years_ago:
                    user_post_counts[author] += 1
                    user_post_dates[author].append(dt)

# Get top 15 users by post count
top_users = [user for user, _ in user_post_counts.most_common(15)]

# Bin posts by month for each user
def month_label(dt):
    return f"{dt.year}-{dt.month:02d}"

user_month_counts = defaultdict(lambda: defaultdict(int))
all_months = set()
for user in top_users:
    for dt in user_post_dates[user]:
        label = month_label(dt)
        user_month_counts[user][label] += 1
        all_months.add(label)

# Sort months
all_months = sorted(all_months)

# Output CSV
os.makedirs(ANALYSIS_DIR, exist_ok=True)
csv_path = os.path.join(ANALYSIS_DIR, "top_15_users_by_posts_timeseries.csv")
with open(csv_path, "w", newline='', encoding="utf-8") as csvfile:
    import csv
    writer = csv.writer(csvfile)
    writer.writerow(["user"] + all_months)
    for user in top_users:
        row = [user] + [user_month_counts[user].get(m, 0) for m in all_months]
        writer.writerow(row)
print(f"Saved monthly post counts for top 15 users to {csv_path}")

# Plotting
plt.figure(figsize=(20, 10))
for user in top_users:
    counts = [user_month_counts[user].get(m, 0) for m in all_months]
    plt.plot(all_months, counts, marker='o', label=user)
plt.xlabel('Month')
plt.ylabel('Number of Posts')
plt.title('Top 15 Users by Posts (Monthly, Last 5 Years)')
plt.xticks(rotation=90)
plt.legend()
plt.tight_layout()
plot_path = os.path.join(ANALYSIS_DIR, "top_15_users_by_posts_timeseries.png")
plt.savefig(plot_path)
print(f"Saved plot to {plot_path}") 