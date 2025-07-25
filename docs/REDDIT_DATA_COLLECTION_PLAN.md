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

## Progress Update

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

## Longitudinal Per-User Journaling Timelines & Exploratory Data Analysis

### Objective

To generate a corpus of longitudinal, per-user journaling timelines from Reddit data, enabling deep analysis of recovery trajectories, semantic expression, and prompt suitability. This corpus will serve as the foundation for developing analytical tools and exploratory data analysis (EDA) to better understand recovery states and the evolution of user narratives.

### Exploratory Data Analysis Plan

For each high-activity user (e.g., Sareeee48), perform EDA across the following axes:

#### Temporal Analysis
- Plot post/comment frequency over time (weekly/monthly bins)
- Identify time gaps or periods of increased activity
- Compute average interval between entries

#### Content & Topic Analysis
- LLM-Based analysis:
- System prompt for 5b model:
"You are a clinical language model tasked with scoring user-written Reddit posts related to eating, body image, or self-perception. For each input text, assign a score between 0 and 1 for the following five dimensions. A score of 0 means there is no evidence of the dimension in the text. A score of 1 means there is strong, explicit evidence. Use only the information present in the text. Do not infer or assume anything not clearly stated.

Definitions of each dimension:

Restraint – Mentions of deliberate attempts to limit eating, skip meals, avoid food, or follow rigid eating rules. Examples: "I skipped dinner," "I try not to eat carbs," "I feel proud when I don’t eat."

Body Dissatisfaction – Negative statements about body shape, size, or appearance. Examples: "I hate my stomach," "I can’t stand how I look," "My arms disgust me."

Weight Concern – Anxiety or distress about gaining or maintaining weight. Examples: "I’m scared of gaining weight," "The scale controls my day," "Even small changes freak me out."

Preoccupation – Recurrent thoughts or obsessions with food, weight, or body that interfere with functioning. Examples: "I think about food constantly," "I can’t focus on anything else," "It’s always on my mind."

Importance – Degree to which shape or weight determines self-worth, identity, or control. Examples: "My body is the only thing I control," "If I gain weight, I’m nothing," "My worth depends on how I look."

Output your result as a dictionary with keys as the dimension names and values as floats between 0 and 1. Do not add explanations."

#### Linguistic & Sentiment Features
- Sentiment analysis (e.g., VADER, RoBERTa): trend over time
- Emotion tagging (e.g., fear, anger, sadness, hope)
- Word count per entry (verbosity trends)
- Lexical richness (e.g., unique word ratio)

#### Narrative Trajectory
- Identify shifts in pronoun usage (e.g., “I” vs “you” vs “we”)
- Extract recurring self-referential phrases (e.g., “I feel”, “I can’t”, “I want to”)
- Detect expressions of agency vs helplessness

#### Recovery-Relevant Markers
- Frequency of recovery terms (e.g., “therapy,” “relapse,” “meal plan,” “urge”)
- Presence of motivation language vs denial/resistance
- Quotes or reflections that show insight or change in mindset

#### Prompt Suitability
- Identify segments that could be transformed into journaling entries
- Identify implicit “prompts” the user responded to (e.g., "Someone asked about...")

### Data Inclusion Principle

Both posts and comments are essential for constructing rich, high-resolution user timelines and for all downstream EDA. All analyses and visualizations should aggregate both types of user-generated content.

--- 

## Exploratory Data Analysis (EDA) Summary (2024)

### Purpose
- To understand longitudinal, per-user and cross-user behavioral, semantic, and recovery trajectories in eating disorder-related subreddits.
- To build a foundation for downstream modeling, prompt design, and app feature development by deeply characterizing Reddit user histories.

### Data Sources
- Per-user JSONL timelines (posts + comments) from subreddits: AnorexiaNervosa, ARFID, bulimia, EatingDisorders, fuckeatingdisorders.
- Top users identified by activity; timelines include timestamps, subreddit, and full text.

### Core EDA Components & Findings
- **Temporal Analysis:** User activity is bursty, with periods of high and low engagement. Gaps and high-density stretches are common.
- **Topic Modeling (LDA, BERTopic):** Recurring themes identified, but topic interpretability depends on model and parameters. Global LDA enables cross-user comparison.
- **LLM-Based Subscale Scoring:** Automated scoring of posts/comments on EDE-Q subscales (Restraint, Body Dissatisfaction, Weight Concern, Preoccupation, Importance) reveals nuanced, longitudinal trends, but is computationally expensive.
- **Embedding-Based Theme Discovery:** UMAP+HDBSCAN clustering of sentence embeddings reveals latent semantic themes and user trajectories. Cluster interpretability and granularity depend on parameter tuning; large min_cluster_size may yield no clusters.
- **Cluster Summarization:** Top terms for each cluster help interpret emergent themes. Most clusters are interpretable, but some are broad or noisy.

### Limitations
- LLM scoring is slow for large datasets.
- Clustering and topic modeling require careful parameter tuning and manual review for interpretability.
- Some logic is duplicated across scripts; modularization is in progress.

### Next Steps
- Refactor EDA codebase for modularity and reusability (see `eda_utils.py`).
- Tune clustering parameters and explore additional dimensionality reduction techniques.
- Integrate EDA outputs with downstream modeling and prompt design.
- Expand analysis to more users and subreddits as data grows.

--- 