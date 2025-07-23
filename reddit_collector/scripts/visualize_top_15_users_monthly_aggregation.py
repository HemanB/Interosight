import os
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

ANALYSIS_DIR = os.path.join(os.path.dirname(__file__), '../analysis/')
csv_path = os.path.join(ANALYSIS_DIR, "top_15_users_monthly_aggregation.csv")

# Load data
if not os.path.exists(csv_path):
    print(f"CSV not found: {csv_path}")
    exit(1)

df = pd.read_csv(csv_path)

# Pivot for heatmap (users x months)
pivot = df.pivot(index='user', columns='month', values='total_count').fillna(0)

# Plot time series for each user
plt.figure(figsize=(20, 10))
for user in pivot.index:
    plt.plot(pivot.columns, pivot.loc[user], marker='o', label=user)
plt.xlabel('Month')
plt.ylabel('Total Activity (Posts + Comments)')
plt.title('Top 15 Users: Monthly Activity Time Series')
plt.xticks(rotation=90)
plt.legend()
plt.tight_layout()
plot_path = os.path.join(ANALYSIS_DIR, "top_15_users_monthly_activity_timeseries.png")
plt.savefig(plot_path)
print(f"Saved time series plot to {plot_path}")
plt.close()

# Plot heatmap
plt.figure(figsize=(20, 8))
plt.imshow(pivot, aspect='auto', cmap='viridis')
plt.colorbar(label='Total Activity (Posts + Comments)')
plt.yticks(np.arange(len(pivot.index)), pivot.index)
plt.xticks(np.arange(len(pivot.columns)), pivot.columns, rotation=90)
plt.xlabel('Month')
plt.ylabel('User')
plt.title('Top 15 Users: Monthly Activity Heatmap')
plt.tight_layout()
heatmap_path = os.path.join(ANALYSIS_DIR, "top_15_users_monthly_activity_heatmap.png")
plt.savefig(heatmap_path)
print(f"Saved heatmap to {heatmap_path}")
plt.close() 