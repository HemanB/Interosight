import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import json
import os
import argparse
import requests
from tqdm import tqdm

SYSTEM_PROMPT = """
You are a clinical language model tasked with scoring user-written Reddit posts related to eating, body image, or self-perception. For each input text, assign a score between 0 and 1 for the following five dimensions. A score of 0 means there is no evidence of the dimension in the text. A score of 1 means there is strong, explicit evidence. Use only the information present in the text. Do not infer or assume anything not clearly stated.

Definitions of each dimension:

Restraint – Mentions of deliberate attempts to limit eating, skip meals, avoid food, or follow rigid eating rules. Examples: "I skipped dinner," "I try not to eat carbs," "I feel proud when I don’t eat."

Body Dissatisfaction – Negative statements about body shape, size, or appearance. Examples: "I hate my stomach," "I can’t stand how I look," "My arms disgust me."

Weight Concern – Anxiety or distress about gaining or maintaining weight. Examples: "I’m scared of gaining weight," "The scale controls my day," "Even small changes freak me out."

Preoccupation – Recurrent thoughts or obsessions with food, weight, or body that interfere with functioning. Examples: "I think about food constantly," "I can’t focus on anything else," "It’s always on my mind."

Importance – Degree to which shape or weight determines self-worth, identity, or control. Examples: "My body is the only thing I control," "If I gain weight, I’m nothing," "My worth depends on how I look."

Output your result as a dictionary with keys as the dimension names and values as floats between 0 and 1. Do not add explanations.
"""

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2:1b"  # Default to lightweight model for speed


def call_ollama(text, system_prompt=SYSTEM_PROMPT, model=OLLAMA_MODEL):
    payload = {
        "model": model,
        "system": system_prompt,
        "prompt": text,
        "stream": False
    }
    response = requests.post(OLLAMA_URL, json=payload)
    response.raise_for_status()
    result = response.json()
    # The model's output is in result['response']
    return result['response']


def parse_scores(llm_output):
    try:
        # Try to parse as a Python dict
        scores = eval(llm_output, {"__builtins__": {}})
        if isinstance(scores, dict):
            return scores
    except Exception:
        pass
    # If parsing fails, return None
    return None


def main():
    parser = argparse.ArgumentParser(description='EDE-Q LLM scoring for Reddit user timeline')
    parser.add_argument('--input', required=True, help='Path to user JSONL timeline')
    parser.add_argument('--outdir', default='.', help='Directory to save outputs')
    parser.add_argument('--model', default=OLLAMA_MODEL, help='Ollama model name')
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    df = pd.read_json(args.input, lines=True)
    df['datetime'] = pd.to_datetime(df['datetime'])

    # Resumability: check for existing scores
    scores_path = os.path.join(args.outdir, 'edeq_llm_scores.csv')
    if os.path.exists(scores_path):
        existing = pd.read_csv(scores_path)
        # Identify already-scored indices (assume same order)
        already_scored = existing.index.tolist()
        print(f"Resuming: {len(already_scored)} entries already scored.")
    else:
        existing = None
        already_scored = []

    scores_list = [] if existing is None else existing[[
        'Restraint', 'Body Dissatisfaction', 'Weight Concern', 'Preoccupation', 'Importance']].to_dict('records')

    for idx, row in tqdm(df.iterrows(), total=len(df)):
        if idx in already_scored:
            continue
        text = row['text']
        try:
            llm_output = call_ollama(text, model=args.model)
            scores = parse_scores(llm_output)
            if scores is None:
                scores = {k: None for k in ['Restraint', 'Body Dissatisfaction', 'Weight Concern', 'Preoccupation', 'Importance']}
        except Exception as e:
            print(f"Error on row {idx}: {e}")
            scores = {k: None for k in ['Restraint', 'Body Dissatisfaction', 'Weight Concern', 'Preoccupation', 'Importance']}
        scores_list.append(scores)
        # Save progress every 10 rows
        if (idx + 1) % 10 == 0:
            temp_df = pd.concat([df.iloc[:len(scores_list)], pd.DataFrame(scores_list)], axis=1)
            temp_df.to_csv(scores_path, index=False)

    # Final save
    result_df = pd.concat([df.iloc[:len(scores_list)], pd.DataFrame(scores_list)], axis=1)
    result_df.to_csv(scores_path, index=False)

    # Aggregate by month
    result_df['month'] = result_df['datetime'].dt.to_period('M').astype(str)
    monthly_means = result_df.groupby('month')[['Restraint', 'Body Dissatisfaction', 'Weight Concern', 'Preoccupation', 'Importance']].mean()
    monthly_means.to_csv(os.path.join(args.outdir, 'edeq_llm_monthly_means.csv'))

    # Plot
    plt.figure(figsize=(12, 7))
    monthly_means.plot(marker='o')
    plt.title('EDE-Q Subscale Scores Over Time (Monthly Averages)')
    plt.xlabel('Month')
    plt.ylabel('Score (0-1)')
    plt.legend(title='Subscale')
    plt.tight_layout()
    plt.savefig(os.path.join(args.outdir, 'edeq_llm_monthly_means.png'))
    plt.close()
    print(f"Done. Outputs saved to {args.outdir}")

if __name__ == '__main__':
    main() 