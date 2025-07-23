# Reddit Data Collection Plan

## Key Lessons and Insights

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