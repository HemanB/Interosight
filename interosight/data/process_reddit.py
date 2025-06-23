#!/usr/bin/env python3
"""
Process Reddit data for InteroSight training.

This script takes raw Reddit posts and converts them to a conversation format
suitable for training a motivational interviewing model.
"""

import argparse
import json
import logging
import pandas as pd
import re
from pathlib import Path
from typing import List, Dict, Any

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def clean_reddit_text(text: str) -> str:
    """
    Clean Reddit text by removing formatting and normalizing.
    
    Args:
        text: Raw Reddit post text
        
    Returns:
        Cleaned text suitable for conversation
    """
    if pd.isna(text) or not text:
        return ""
    
    # Remove Reddit-specific formatting
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)  # Remove markdown links
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # Remove bold
    text = re.sub(r'\*([^*]+)\*', r'\1', text)  # Remove italic
    text = re.sub(r'`([^`]+)`', r'\1', text)  # Remove code blocks
    text = re.sub(r'#{1,6}\s+', '', text)  # Remove headers
    
    # Remove excessive whitespace
    text = re.sub(r'\n\s*\n', '\n', text)
    text = re.sub(r' +', ' ', text)
    
    # Remove common Reddit phrases that don't fit conversation
    text = re.sub(r'\b(edit|EDIT):\s*', '', text)
    text = re.sub(r'\b(thanks|thank you|thx)\s*(in advance|ahead|so much)?\s*[!.]*', '', text, flags=re.IGNORECASE)
    
    return text.strip()

def filter_relevant_posts(df: pd.DataFrame, min_length: int = 50, max_length: int = 2000) -> pd.DataFrame:
    """
    Filter posts based on relevance criteria.
    
    Args:
        df: DataFrame with Reddit posts
        min_length: Minimum post length in characters
        max_length: Maximum post length in characters
        
    Returns:
        Filtered DataFrame
    """
    # Remove posts that are too short or too long
    df = df[df['text'].str.len() >= min_length]
    df = df[df['text'].str.len() <= max_length]
    
    # Remove posts that are mostly links or code
    df = df[~df['text'].str.contains(r'^https?://', na=False)]
    df = df[~df['text'].str.contains(r'```.*```', na=False, flags=re.DOTALL)]
    
    # Remove posts that are just questions without context
    question_only = df['text'].str.match(r'^[A-Z][^.!?]*\?$', na=False)
    df = df[~question_only]
    
    return df

def process_reddit_data(input_path: str, output_path: str, sample_size: int = None) -> None:
    """
    Process Reddit data and convert to conversation format.
    
    Args:
        input_path: Path to Reddit posts CSV file
        output_path: Path to output JSONL file
        sample_size: Number of posts to process (None for all)
    """
    logger.info(f"Loading Reddit data from {input_path}")
    
    # Load data
    df = pd.read_csv(input_path)
    
    if sample_size:
        df = df.sample(n=min(sample_size, len(df)), random_state=42)
        logger.info(f"Sampled {len(df)} posts")
    
    # Clean and filter posts
    logger.info("Cleaning and filtering posts...")
    df['text'] = df['text'].apply(clean_reddit_text)
    df = filter_relevant_posts(df)
    
    logger.info(f"Processing {len(df)} posts")
    
    # Convert to conversation format
    conversations = []
    for _, row in df.iterrows():
        conversation = {
            'id': row.get('id', str(len(conversations))),
            'user_input': row['text'],
            'source': 'reddit',
            'metadata': {
                'subreddit': row.get('subreddit', 'unknown'),
                'score': row.get('score', 0),
                'num_comments': row.get('num_comments', 0),
                'created_utc': row.get('created_utc', None)
            }
        }
        conversations.append(conversation)
    
    # Save to JSONL
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        for conv in conversations:
            f.write(json.dumps(conv) + '\n')
    
    logger.info(f"Saved {len(conversations)} conversations to {output_path}")

def main():
    """Main function for command-line usage."""
    parser = argparse.ArgumentParser(description="Process Reddit data for InteroSight")
    parser.add_argument(
        "--input", 
        type=str, 
        required=True,
        help="Path to Reddit posts CSV file"
    )
    parser.add_argument(
        "--output", 
        type=str, 
        required=True,
        help="Path to output JSONL file"
    )
    parser.add_argument(
        "--sample_size", 
        type=int, 
        default=None,
        help="Number of posts to process (default: all)"
    )
    
    args = parser.parse_args()
    
    process_reddit_data(args.input, args.output, args.sample_size)

if __name__ == "__main__":
    main() 