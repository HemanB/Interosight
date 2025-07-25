import os
import json
import datetime
from collections import defaultdict

BASE_DIR = os.path.join(os.path.dirname(__file__), '../database/')
ANALYSIS_DIR = os.path.join(os.path.dirname(__file__), '../analysis/')
subreddits = ["AnorexiaNervosa", "ARFID", "bulimia", "EatingDisorders", "fuckeatingdisorders"]
TARGET_USER = "Sareeee48"

# Helper to recursively build comment context
# comment_lookup: {comment_id: comment_obj}
def build_comment_context(comment, comment_lookup):
    context = []
    current = comment
    while True:
        parent_id = current.get('parent_id')
        if parent_id and parent_id.startswith('t1_'):
            parent_comment_id = parent_id[3:]
            parent = comment_lookup.get(parent_comment_id)
            if parent:
                context.append({
                    'id': parent.get('id'),
                    'author': parent.get('author'),
                    'body': parent.get('body'),
                    'created_utc': parent.get('created_utc')
                })
                current = parent
            else:
                break
        else:
            break
    return list(reversed(context))

# Collect all activity for the user
events = []
for subreddit in subreddits:
    sub_dir = os.path.join(BASE_DIR, subreddit)
    if not os.path.isdir(sub_dir):
        continue
    for fname in os.listdir(sub_dir):
        if not fname.endswith('.json'):
            continue
        with open(os.path.join(sub_dir, fname), 'r') as f:
            data = json.load(f)
            # Post
            if data.get('author') == TARGET_USER and data.get('created_utc'):
                events.append({
                    'type': 'post',
                    'timestamp': data['created_utc'],
                    'datetime': datetime.datetime.utcfromtimestamp(data['created_utc']).isoformat(),
                    'subreddit': subreddit,
                    'id': data.get('id'),
                    'text': data.get('selftext', ''),
                    'title': data.get('title', ''),
                    'context': None
                })
            # Build comment lookup for context
            comment_lookup = {c['id']: c for c in data.get('comments', []) if 'id' in c}
            # Comments
            for comment in data.get('comments', []):
                if comment.get('author') == TARGET_USER and comment.get('created_utc'):
                    context = build_comment_context(comment, comment_lookup)
                    events.append({
                        'type': 'comment',
                        'timestamp': comment['created_utc'],
                        'datetime': datetime.datetime.utcfromtimestamp(comment['created_utc']).isoformat(),
                        'subreddit': subreddit,
                        'id': comment.get('id'),
                        'text': comment.get('body', ''),
                        'parent_id': comment.get('parent_id'),
                        'link_id': comment.get('link_id'),
                        'context': context if context else None
                    })

# Sort all events by timestamp
events.sort(key=lambda e: e['timestamp'])

# Output as JSONL
ios_path = os.path.join(ANALYSIS_DIR, f"{TARGET_USER}_full_timeline.jsonl")
os.makedirs(ANALYSIS_DIR, exist_ok=True)
with open(ios_path, 'w', encoding='utf-8') as f:
    for event in events:
        f.write(json.dumps(event, ensure_ascii=False) + '\n')
print(f"Saved full timeline for {TARGET_USER} to {ios_path}") 