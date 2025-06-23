#!/usr/bin/env python3
"""
Filter conversations for ED-related content.
"""

import argparse
import json
import logging
import re
from pathlib import Path
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ED-related keywords and phrases
ED_KEYWORDS = [
    # Eating disorder terms
    'anorexia', 'bulimia', 'binge', 'purge', 'restrict', 'restriction',
    'ednos', 'osfed', 'arfid', 'orthorexia', 'anorexia nervosa', 'bulimia nervosa',
    
    # ED behaviors
    'binge eating', 'purging', 'vomiting', 'laxatives', 'diuretics',
    'overexercise', 'compulsive exercise', 'body checking', 'body dysmorphia',
    'fear foods', 'safe foods', 'meal plan', 'calorie counting',
    
    # ED thoughts and feelings
    'body image', 'body dysmorphic', 'body hate', 'body shame',
    'fear of gaining weight', 'fear of food', 'food anxiety',
    'disordered eating', 'eating disorder', 'recovery', 'relapse',
    
    # Weight and body focus
    'underweight', 'overweight', 'obese', 'thin', 'skinny',
    'weight loss', 'weight gain', 'body fat', 'muscle',
    
    # Mental health related
    'depression', 'anxiety', 'ocd', 'perfectionism', 'control',
    'self worth', 'self esteem', 'validation', 'therapy', 'treatment',
    
    # Physical symptoms
    'amenorrhea', 'lanugo', 'bradycardia', 'hypotension', 'electrolyte imbalance',
    'dehydration', 'malnutrition', 'starvation', 'fainting', 'dizziness'
]

# General dieting/fitness terms to exclude (unless combined with ED terms)
DIETING_TERMS = [
    'keto', 'paleo', 'vegan', 'vegetarian', 'intermittent fasting',
    'macro tracking', 'protein shake', 'supplements', 'workout routine',
    'gym', 'fitness', 'muscle building', 'strength training',
    'meal prep', 'healthy eating', 'clean eating', 'organic'
]

def contains_ed_content(text: str) -> bool:
    text_lower = text.lower()
    
    # Check for ED keywords
    ed_matches = sum(1 for keyword in ED_KEYWORDS if keyword.lower() in text_lower)
    
    # Check for dieting terms
    dieting_matches = sum(1 for term in DIETING_TERMS if term.lower() in text_lower)
    
    # If there are ED keywords, it's likely ED-related
    if ed_matches > 0:
        return True
    
    # If there are many dieting terms but no ED terms, it's likely general dieting
    if dieting_matches >= 3 and ed_matches == 0:
        return False
    
    # Check for emotional/struggle language that might indicate ED
    emotional_indicators = [
        'struggle', 'struggling', 'hard', 'difficult', 'painful',
        'sad', 'depressed', 'anxious', 'scared', 'afraid', 'fear',
        'hate', 'disgust', 'shame', 'guilt', 'worthless', 'hopeless',
        'tired', 'exhausted', 'weak', 'sick', 'ill'
    ]
    
    emotional_matches = sum(1 for word in emotional_indicators if word in text_lower)
    
    # If there are emotional indicators and some dieting terms, it might be ED-related
    if emotional_matches >= 2 and dieting_matches >= 1:
        return True
    
    return False

def filter_ed_conversations(input_path: str, output_path: str, sample_size: int = None) -> None:
    logger.info(f"Loading conversations from {input_path}")
    
    conversations = []
    with open(input_path, 'r') as f:
        for line in f:
            conversations.append(json.loads(line.strip()))
    
    if sample_size:
        conversations = conversations[:sample_size]
        logger.info(f"Processing {len(conversations)} conversations")
    
    logger.info("Filtering for ED-related content...")
    ed_conversations = []
    
    for conv in conversations:
        if contains_ed_content(conv['user_input']):
            ed_conversations.append(conv)
    
    logger.info(f"Found {len(ed_conversations)} ED-related conversations out of {len(conversations)} total")
    
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        for conv in ed_conversations:
            f.write(json.dumps(conv) + '\n')
    
    logger.info(f"Saved {len(ed_conversations)} ED-related conversations to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Filter conversations for ED-related content")
    parser.add_argument("--input", type=str, required=True, help="Path to input conversations JSONL file")
    parser.add_argument("--output", type=str, required=True, help="Path to output filtered conversations JSONL file")
    parser.add_argument("--sample_size", type=int, default=None, help="Number of conversations to process")
    
    args = parser.parse_args()
    
    filter_ed_conversations(args.input, args.output, args.sample_size)

if __name__ == "__main__":
    main()
