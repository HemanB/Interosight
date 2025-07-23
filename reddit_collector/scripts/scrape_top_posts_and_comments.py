import praw
import os
import json
from praw.models import MoreComments
from dotenv import load_dotenv
import time

load_dotenv(dotenv_path='reddit_collector/.env')    # Load environment variables from .env file

# --- CONFIGURATION ---
SUBREDDIT = 'ARFID'   
TOP_POST_LIMIT = 1000
OUTPUT_DIR = f'reddit_collector/database/{SUBREDDIT}/'

# --- SETUP ---
reddit = praw.Reddit(
    client_id=os.getenv('REDDIT_CLIENT_ID'),
    client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
    user_agent=os.getenv('REDDIT_USER_AGENT')
)

os.makedirs(OUTPUT_DIR, exist_ok=True)

def get_comment_context(comment):
    """
    Returns the list of parent comments (context) up to the root post for a given comment.
    """
    context = []
    current = comment
    while True:
        try:
            parent = current.parent()
            if isinstance(parent, praw.models.Comment):
                context.append({
                    'id': parent.id,
                    'author': str(parent.author),
                    'body': parent.body,
                    'created_utc': parent.created_utc
                })
                current = parent
            else:
                break
        except Exception:
            break
    return list(reversed(context))

def main():
    subreddit = reddit.subreddit(SUBREDDIT)
    print(f"Scraping top {TOP_POST_LIMIT} posts from r/{SUBREDDIT}...")
    for idx, submission in enumerate(subreddit.top(limit=TOP_POST_LIMIT)):
        output_path = os.path.join(OUTPUT_DIR, f"{submission.id}.json")
        if os.path.exists(output_path):
            print(f"Skipping duplicate post: {submission.id} (already exists)")
            continue
        print(f"[{idx+1}/{TOP_POST_LIMIT}] {submission.title}")
        post_data = {
            'id': submission.id,
            'subreddit': str(submission.subreddit),
            'author': str(submission.author),
            'created_utc': submission.created_utc,
            'title': submission.title,
            'selftext': submission.selftext,
            'url': submission.url,
            'score': submission.score,
            'num_comments': submission.num_comments,
            'comments': []
        }
        submission.comments.replace_more(limit=None)
        for comment in submission.comments.list():
            if isinstance(comment, MoreComments):
                continue
            comment_data = {
                'id': comment.id,
                'author': str(comment.author),
                'body': comment.body,
                'created_utc': comment.created_utc,
                'score': comment.score,
                'context': get_comment_context(comment)
            }
            post_data['comments'].append(comment_data)
        # Save each post as a separate JSON file
        with open(output_path, 'w') as f:
            json.dump(post_data, f, indent=2)
        time.sleep(1)  # Add delay to avoid rate limiting

if __name__ == '__main__':
    main() 