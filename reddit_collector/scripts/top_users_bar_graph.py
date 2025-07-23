import os
import json
from collections import Counter
import matplotlib.pyplot as plt

# Path to the database directory
BASE_DIR = os.path.join(os.path.dirname(__file__), '../database/')
ANALYSIS_DIR = os.path.join(os.path.dirname(__file__), '../analysis/')
subreddits = ["AnorexiaNervosa", "ARFID", "bulimia", "EatingDisorders", "fuckeatingdisorders"]

user_counts = Counter()

ignore_users = {"AutoModerator", "EDPostRequests", "AnorexiaNervosa-ModTeam", "fuckeatingdisorders-ModTeam"}

for subreddit in subreddits:
    sub_dir = os.path.join(BASE_DIR, subreddit)
    if not os.path.isdir(sub_dir):
        continue
    for fname in os.listdir(sub_dir):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(sub_dir, fname), "r") as f:
            data = json.load(f)
            # Count post author
            author = data.get("author")
            if author and author != "None" and author not in ignore_users:
                user_counts[author] += 1
            # Count comment authors
            for comment in data.get("comments", []):
                c_author = comment.get("author")
                if c_author and c_author != "None" and c_author not in ignore_users:
                    user_counts[c_author] += 1

# Get top 100 users
if user_counts:
    top_users = user_counts.most_common(100)
    usernames, counts = zip(*top_users)

    # Ensure analysis directory exists
    os.makedirs(ANALYSIS_DIR, exist_ok=True)

    # Plot
    plt.figure(figsize=(20, 8))
    plt.bar(usernames, counts)
    plt.xticks(rotation=90)
    plt.xlabel("Username")
    plt.ylabel("Number of Posts + Comments")
    plt.title("Top 100 Reddit Users by Posts + Comments (All Subreddits)")
    plt.tight_layout()
    plt.savefig(os.path.join(ANALYSIS_DIR, 'top_users_bar_graph_across_subreddits.png'))
    print(f"Saved bar graph to {os.path.join(ANALYSIS_DIR, 'top_users_bar_graph_across_subreddits.png')}")
else:
    print("No user data found.") 