# Reddit Data Collection Plan

## Objective

Set up a passive data collector to gather as much longitudinal user data as possible from Reddit, focusing on eating disorder-related subreddits. The goal is to build a rich, time-series dataset of user posts and comments for downstream analysis and modeling.

## Tools & Stack
- **Reddit API** via the latest version of **PRAW** (Python Reddit API Wrapper)
- Python 3.10+
- Secure credential management (Reddit API keys)
- Storage: Local or cloud-based (to be determined)

## Collection Strategies

### 1. User-by-User Collection (Preferred, if possible)
- **Approach:**
  - Identify users with the highest number of posts/comments in target subreddits.
  - For each user, collect their entire Reddit history (posts and comments) using PRAW.
- **Pros:**
  - Directly builds longitudinal timelines for high-activity users.
  - Efficient for downstream user-centric analysis.
- **Cons:**
  - Reddit API may limit access to full user history (especially for older or deleted content).
  - May require additional steps to discover high-activity users.
- **Open Questions:**
  - Can PRAW (and the Reddit API) fetch all posts/comments for a given user, or is there a limit?
  - Are there rate limits or privacy restrictions for user-centric scraping?

### 2. Bulk Collection + User Filtering
- **Approach:**
  - Collect all posts and comments from target subreddits over a defined time window.
  - After collection, analyze the dataset to identify users with high activity.
  - Extract and aggregate longitudinal data for these users.
- **Pros:**
  - Ensures no user data is missed due to API limitations.
  - Can capture deleted or shadowbanned users' public data if still available in subreddit streams.
- **Cons:**
  - Requires more storage and post-processing.
  - Less efficient if only a small subset of users are of interest.
- **Open Questions:**
  - What is the maximum lookback window for subreddit post/comment streams?
  - How to efficiently process and filter for high-activity users?

## Technical Considerations
- **API Rate Limits:** Ensure compliance with Reddit's API rate limits and terms of service.
- **Data Privacy:** Only collect publicly available data. Respect user privacy and Reddit's guidelines.
- **Data Storage:** Plan for scalable storage (potentially large datasets).
- **Metadata:** Capture timestamps, subreddit, post/comment IDs, and any available user metadata.
- **Error Handling:** Handle API errors, rate limits, and incomplete data gracefully.

## Next Steps
1. Research PRAW's current capabilities for user-by-user history collection.
2. Prototype both collection strategies on a small scale.
3. Decide on the optimal approach based on API constraints and data needs.
4. Set up secure credential management for Reddit API keys.
5. Design data schema for storing raw Reddit data and user timelines.
6. Implement the chosen collection pipeline and begin data acquisition.

---

*This document will be updated as technical questions are answered and the collection pipeline is implemented.* 

## Key Lessons and Insights (2024)

- **Posts Alone Are Too Sparse:**
  - Relying only on Reddit posts for user-level longitudinal analysis results in extremely sparse data. Most users post infrequently, making it difficult to extract meaningful behavioral patterns or to train robust models.
  - This sparsity limits the ability to perform time-series analysis, semantic richness tracking, or to simulate the type of engagement expected in a dedicated app environment.

- **Posts + Comments Are Essential:**
  - To obtain useful insight and training data, both posts and comments must be included in the analysis.
  - Comments provide much higher temporal resolution and richer engagement signals, enabling more robust user modeling, semantic analysis, and proxying of app-like longitudinal data.
  - For all future Reddit-based data collection and modeling, always aggregate both posts and comments for each user.

## Practical Recommendations

- When identifying top users, use the sum of posts and comments, not just posts.
- For time-series and semantic analysis, aggregate all user-generated text (posts + comments) by the desired time window (e.g., day, week, month).
- Document and justify this approach in all downstream analyses and reports.

---

*This plan is a living document. Update as new insights are gained from data exploration and modeling.* 

## Progress Update (2024)

- **Data Collection:**
  - Posts and comments have been collected from the following subreddits: AnorexiaNervosa, ARFID, bulimia, EatingDisorders, fuckeatingdisorders.
  - Data is stored in per-post JSON files, with all comments included.

- **Top User Identification:**
  - Top users are identified by total posts + comments in the last 5 years, excluding bots and moderators.
  - Scripts have been developed to aggregate and analyze the top 15 and top 100 users.

- **Monthly Aggregation & Visualization:**
  - Activity (posts + comments) is aggregated by month for top users, with basic text statistics (word count, average length).
  - CSVs and visualizations (time series, heatmaps) have been generated to inspect user engagement patterns.

- **Semantic Analysis:**
  - Scripts compute daily semantic richness metrics (lexical diversity, vocabulary size, sentence length, readability) for individual users.
  - These metrics are visualized and saved for downstream modeling.

- **Full Timeline Aggregation:**
  - For the top 100 users, all activity (posts and comments) is aggregated into a single, timestamped timeline per user (JSONL format).
  - For comments, the full prior comment thread is included as context, mimicking the type of context-rich data expected from the future app.
  - The schema is designed to be generalizable for future app data collection and modeling.

- **Ready for Modeling:**
  - The data is now ready for unsupervised, state-based ML modeling and further feature engineering.

--- 