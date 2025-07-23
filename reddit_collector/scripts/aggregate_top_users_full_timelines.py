import os
import json
import datetime
from collections import Counter, defaultdict

BASE_DIR = os.path.join(os.path.dirname(__file__), '../database/')
ANALYSIS_DIR = os.path.join(os.path.dirname(__file__), '../analysis/')
subreddits = ["AnorexiaNervosa", "ARFID", "bulimia", "EatingDisorders", "fuckeatingdisorders"]
ignore_users = {"AutoModerator", "EDPostRequests", "AnorexiaNervosa-ModTeam", "fuckeatingdisorders-ModTeam"}

now = datetime.datetime.utcnow()
five_years_ago = now - datetime.timedelta(days=5*365)

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

# 1. Count posts+comments per user in last 5 years
total_counts = Counter()
user_events = defaultdict(list)

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
            author = data.get('author')
            created_utc = data.get('created_utc')
            if author and author != 'None' and author not in ignore_users and created_utc:
                dt = datetime.datetime.utcfromtimestamp(created_utc)
                if dt >= five_years_ago:
                    user_events[author].append({
                        'type': 'post',
                        'timestamp': created_utc,
                        'datetime': dt.isoformat(),
                        'subreddit': subreddit,
                        'id': data.get('id'),
                        'text': data.get('selftext', ''),
                        'title': data.get('title', ''),
                        'context': None
                    })
                    total_counts[author] += 1
            # Build comment lookup for context
            comment_lookup = {c['id']: c for c in data.get('comments', []) if 'id' in c}
            # Comments
            for comment in data.get('comments', []):
                c_author = comment.get('author')
                c_created_utc = comment.get('created_utc')
                if c_author and c_author != 'None' and c_author not in ignore_users and c_created_utc:
                    dt = datetime.datetime.utcfromtimestamp(c_created_utc)
                    if dt >= five_years_ago:
                        context = build_comment_context(comment, comment_lookup)
                        user_events[c_author].append({
                            'type': 'comment',
                            'timestamp': c_created_utc,
                            'datetime': dt.isoformat(),
                            'subreddit': subreddit,
                            'id': comment.get('id'),
                            'text': comment.get('body', ''),
                            'parent_id': comment.get('parent_id'),
                            'link_id': comment.get('link_id'),
                            'context': context if context else None
                        })
                        total_counts[c_author] += 1

# 2. Get top 100 users by total posts+comments
top_users = [user for user, _ in total_counts.most_common(100)]

# 3. Output one JSONL file per user
os.makedirs(ANALYSIS_DIR, exist_ok=True)
for user in top_users:
    events = user_events[user]
    events.sort(key=lambda e: e['timestamp'])
    out_path = os.path.join(ANALYSIS_DIR, f"{user}_full_timeline.jsonl")
    with open(out_path, 'w', encoding='utf-8') as f:
        for event in events:
            f.write(json.dumps(event, ensure_ascii=False) + '\n')
    print(f"Saved full timeline for {user} to {out_path}") 