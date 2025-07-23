import os
import json
import re
from collections import defaultdict, Counter
import matplotlib.pyplot as plt
import datetime
import nltk
import textstat
from nltk.tokenize import word_tokenize, sent_tokenize

# Ensure nltk data is available
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

BASE_DIR = os.path.join(os.path.dirname(__file__), '../database/')
ANALYSIS_DIR = os.path.join(os.path.dirname(__file__), '../analysis/')
subreddits = ["AnorexiaNervosa", "ARFID", "bulimia", "EatingDisorders", "fuckeatingdisorders"]
TARGET_USER = "Sareeee48"

# Aggregate all texts by day
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
            if data.get("author") == TARGET_USER and data.get("created_utc"):
                dt = datetime.datetime.utcfromtimestamp(data["created_utc"])
                date_str = dt.strftime("%Y-%m-%d")
                text = data.get("selftext", "")
                if text:
                    user_daily_texts[date_str].append(text)
            # Comments
            for comment in data.get("comments", []):
                if comment.get("author") == TARGET_USER and comment.get("created_utc"):
                    dt = datetime.datetime.utcfromtimestamp(comment["created_utc"])
                    date_str = dt.strftime("%Y-%m-%d")
                    text = comment.get("body", "")
                    if text:
                        user_daily_texts[date_str].append(text)

# Compute metrics per day
results = []
for date_str in sorted(user_daily_texts.keys()):
    texts = user_daily_texts[date_str]
    full_text = "\n".join(texts)
    words = word_tokenize(full_text)
    sentences = sent_tokenize(full_text)
    unique_words = set(w.lower() for w in words if w.isalpha())
    vocab_size = len(unique_words)
    total_words = len([w for w in words if w.isalpha()])
    lexical_diversity = vocab_size / total_words if total_words else 0
    avg_sentence_length = total_words / len(sentences) if sentences else 0
    flesch_reading_ease = textstat.flesch_reading_ease(full_text) if full_text.strip() else 0
    results.append({
        "date": date_str,
        "total_words": total_words,
        "vocab_size": vocab_size,
        "lexical_diversity": lexical_diversity,
        "avg_sentence_length": avg_sentence_length,
        "flesch_reading_ease": flesch_reading_ease
    })

# Output to CSV
os.makedirs(ANALYSIS_DIR, exist_ok=True)
csv_path = os.path.join(ANALYSIS_DIR, f"Sareeee48_semantic_richness_timeseries.csv")
with open(csv_path, "w", newline='', encoding="utf-8") as csvfile:
    import csv
    writer = csv.writer(csvfile)
    writer.writerow(["date", "total_words", "vocab_size", "lexical_diversity", "avg_sentence_length", "flesch_reading_ease"])
    for row in results:
        writer.writerow([row["date"], row["total_words"], row["vocab_size"], f"{row['lexical_diversity']:.3f}", f"{row['avg_sentence_length']:.2f}", f"{row['flesch_reading_ease']:.2f}"])
print(f"Saved daily semantic richness metrics to {csv_path}")

# Plotting
if results:
    dates = [row["date"] for row in results]
    lexical_diversity = [row["lexical_diversity"] for row in results]
    vocab_size = [row["vocab_size"] for row in results]
    avg_sentence_length = [row["avg_sentence_length"] for row in results]
    flesch_reading_ease = [row["flesch_reading_ease"] for row in results]

    fig, axs = plt.subplots(4, 1, figsize=(18, 16), sharex=True)
    axs[0].plot(dates, lexical_diversity, marker='o')
    axs[0].set_ylabel('Lexical Diversity')
    axs[0].set_title('Daily Lexical Diversity (Type-Token Ratio)')

    axs[1].plot(dates, vocab_size, marker='o', color='tab:orange')
    axs[1].set_ylabel('Vocabulary Size')
    axs[1].set_title('Daily Vocabulary Size (Unique Words)')

    axs[2].plot(dates, avg_sentence_length, marker='o', color='tab:green')
    axs[2].set_ylabel('Avg Sentence Length')
    axs[2].set_title('Daily Average Sentence Length (words)')

    axs[3].plot(dates, flesch_reading_ease, marker='o', color='tab:red')
    axs[3].set_ylabel('Flesch Reading Ease')
    axs[3].set_title('Daily Flesch Reading Ease')
    axs[3].set_xlabel('Date')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plot_path = os.path.join(ANALYSIS_DIR, f"Sareeee48_semantic_richness_timeseries.png")
    plt.savefig(plot_path)
    print(f"Saved semantic richness timeseries plot to {plot_path}")
else:
    print("No data to plot.") 