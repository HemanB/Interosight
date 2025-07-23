import os
import json
from collections import defaultdict
import datetime
import csv
import matplotlib.pyplot as plt
from datetime import timedelta

BASE_DIR = os.path.join(os.path.dirname(__file__), '../database/')
ANALYSIS_DIR = os.path.join(os.path.dirname(__file__), '../analysis/')
subreddits = ["AnorexiaNervosa", "ARFID", "bulimia", "EatingDisorders", "fuckeatingdisorders"]
ignore_users = {"AutoModerator", "EDPostRequests", "AnorexiaNervosa-ModTeam", "fuckeatingdisorders-ModTeam"}
TARGET_USER = "Sareeee48"

# {date_str: [list of (text, type, subreddit, post_id, comment_id)]}
user_daily_texts = defaultdict(list)

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
            if author == TARGET_USER and created_utc:
                dt = datetime.datetime.utcfromtimestamp(created_utc)
                date_str = dt.strftime("%Y-%m-%d")
                text = data.get("selftext", "")
                user_daily_texts[date_str].append((text, "post", subreddit, data.get("id"), None))
            # Comments
            for comment in data.get("comments", []):
                c_author = comment.get("author")
                c_created_utc = comment.get("created_utc")
                if c_author == TARGET_USER and c_created_utc:
                    dt = datetime.datetime.utcfromtimestamp(c_created_utc)
                    date_str = dt.strftime("%Y-%m-%d")
                    text = comment.get("body", "")
                    user_daily_texts[date_str].append((text, "comment", subreddit, data.get("id"), comment.get("id")))

# Analyze daily density
results = []
for date_str, entries in user_daily_texts.items():
    freq = len(entries)
    total_chars = sum(len(e[0]) for e in entries)
    results.append({
        "date": date_str,
        "frequency": freq,
        "total_chars": total_chars,
        "entries": entries
    })

# Sort by date
results.sort(key=lambda x: x["date"])

# Find high-density stretches: at least 1 per day, allow up to 1 missed day, min 30 days
all_dates = sorted(user_daily_texts.keys())
if all_dates:
    min_date = min(all_dates)
    max_date = max(all_dates)
    date_range = [(datetime.datetime.strptime(min_date, "%Y-%m-%d") + timedelta(days=i)).strftime("%Y-%m-%d")
                  for i in range((datetime.datetime.strptime(max_date, "%Y-%m-%d") - datetime.datetime.strptime(min_date, "%Y-%m-%d")).days + 1)]
else:
    date_range = []

# Find the most rich 30-day stretches (sliding window, no gap requirement)
window_size = 30
richest_windows = []
if date_range:
    # Build a lookup for date_str -> day data
    day_lookup = {d["date"]: d for d in results}
    for i in range(len(date_range) - window_size + 1):
        window_dates = date_range[i:i+window_size]
        window_days = [day_lookup.get(ds, {"date": ds, "frequency": 0, "total_chars": 0, "entries": []}) for ds in window_dates]
        total_chars = sum(day["total_chars"] for day in window_days)
        total_freq = sum(day["frequency"] for day in window_days)
        richest_windows.append({
            "start_date": window_dates[0],
            "end_date": window_dates[-1],
            "days": window_days,
            "total_chars": total_chars,
            "total_freq": total_freq
        })
    # Sort by total_chars (richness)
    richest_windows.sort(key=lambda w: w["total_chars"], reverse=True)

# Output top 5 stretches to CSV
os.makedirs(ANALYSIS_DIR, exist_ok=True)
csv_path = os.path.join(ANALYSIS_DIR, f"Sareeee48_high_density_segments.csv")
with open(csv_path, "w", newline='', encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["window_rank", "start_date", "end_date", "days", "total_posts_comments", "total_chars", "sample_texts"])
    for i, window in enumerate(richest_windows[:5]):
        start_date = window["start_date"]
        end_date = window["end_date"]
        days = window_size
        total_posts_comments = window["total_freq"]
        total_chars = window["total_chars"]
        # Sample up to 3 texts from the window
        sample_texts = []
        for day in window["days"]:
            for entry in day["entries"]:
                if entry[0]:
                    sample_texts.append(entry[0][:200].replace("\n", " "))
                if len(sample_texts) >= 3:
                    break
            if len(sample_texts) >= 3:
                break
        writer.writerow([i+1, start_date, end_date, days, total_posts_comments, total_chars, " | ".join(sample_texts)])
print(f"Saved high-density segments for {TARGET_USER} to {csv_path}")

# Visualization for the top 3 richest windows
if richest_windows:
    plt.figure(figsize=(18, 12))
    for idx, window in enumerate(richest_windows[:3]):
        dates = [day["date"] for day in window["days"]]
        freqs = [day["frequency"] for day in window["days"]]
        chars = [day["total_chars"] for day in window["days"]]
        ax1 = plt.subplot(3, 1, idx+1)
        ax1.bar(dates, freqs, color='tab:blue', alpha=0.6, label='Frequency (posts/comments)')
        ax1.set_ylabel('Frequency', color='tab:blue')
        ax1.tick_params(axis='y', labelcolor='tab:blue')
        ax1.set_xticks(dates)
        ax1.set_xticklabels(dates, rotation=45, ha='right')
        ax2 = ax1.twinx()
        ax2.plot(dates, chars, color='tab:red', marker='o', label='Total Chars')
        ax2.set_ylabel('Total Chars', color='tab:red')
        ax2.tick_params(axis='y', labelcolor='tab:red')
        ax1.set_title(f"Window {idx+1}: {dates[0]} to {dates[-1]}")
        ax1.legend(loc='upper left')
        ax2.legend(loc='upper right')
    plt.tight_layout()
    plot_path = os.path.join(ANALYSIS_DIR, f"Sareeee48_high_density_stretches_plot.png")
    plt.savefig(plot_path)
    print(f"Saved visualization to {plot_path}") 