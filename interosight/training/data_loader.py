#!/usr/bin/env python3
# interosight/training/data_loader.py

import json
import random
from typing import Tuple, Dict, Any
from datasets import Dataset
from transformers import PreTrainedTokenizer

def load_synthetic_dataset(path: str) -> Dataset:
    """
    Load synthetic training dataset from JSONL file.
    
    Args:
        path: Path to JSONL file containing training data
        
    Returns:
        Dataset object with 'prompt' and 'response' columns
    """
    with open(path, "r") as f:
        lines = [json.loads(l) for l in f if l.strip()]
    return Dataset.from_list(lines)

def format_prompt_response(prompt: str, response: str) -> str:
    """
    Format prompt and response into a single training text.
    
    Args:
        prompt: Input prompt (themes/context)
        response: Model response (motivational interviewing response)
        
    Returns:
        Formatted text for training
    """
    return f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\nYou are a compassionate therapist using motivational interviewing techniques to help people with eating disorders. Respond with empathy and validation while guiding them toward self-reflection.<|eot_id|><|start_header_id|>user<|end_header_id|>\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n{response}<|eot_id|>"

def tokenize_function(examples: Dict[str, Any], 
                     tokenizer: PreTrainedTokenizer, 
                     max_length: int = 512,
                     use_robust_format: bool = False) -> Dict[str, Any]:
    """
    Tokenize the training examples.
    
    Args:
        examples: Dataset examples with 'prompt' and 'response' columns
        tokenizer: Tokenizer to use
        max_length: Maximum sequence length
        use_robust_format: Whether to use robust formatting with topic context
        
    Returns:
        Tokenized examples with 'input_ids' and 'attention_mask'
    """
    # Ensure tokenizer has padding token set
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        tokenizer.pad_token_id = tokenizer.eos_token_id
    
    if use_robust_format:
        # Handle robust data format with topic context
        formatted_texts = [
            format_robust_prompt_response({
                'prompt': prompt, 
                'response': response,
                'topics': topics if 'topics' in examples else {}
            })
            for prompt, response, topics in zip(
                examples['prompt'], 
                examples['response'],
                examples.get('topics', [{}] * len(examples['prompt']))
            )
        ]
    else:
        # Handle synthetic data format
        formatted_texts = [
            format_prompt_response(prompt, response)
            for prompt, response in zip(examples['prompt'], examples['response'])
        ]
    
    tokenized = tokenizer(
        formatted_texts,
        truncation=True,
        padding=True,
        max_length=max_length,
        return_tensors="pt"
    )
    
    # Set labels to input_ids for causal language modeling
    tokenized["labels"] = tokenized["input_ids"].clone()
    
    return tokenized

def prepare_training_data(dataset: Dataset, 
                         tokenizer: PreTrainedTokenizer,
                         max_length: int = 512,
                         train_split: float = 0.9,
                         seed: int = 42,
                         use_robust_format: bool = False) -> Tuple[Dataset, Dataset]:
    """
    Prepare dataset for training by tokenizing and splitting into train/eval.
    
    Args:
        dataset: Raw dataset with 'prompt' and 'response' columns
        tokenizer: Tokenizer to use
        max_length: Maximum sequence length
        train_split: Fraction of data to use for training
        seed: Random seed for reproducibility
        use_robust_format: Whether to use robust formatting with topic context
        
    Returns:
        Tuple of (train_dataset, eval_dataset)
    """
    # Set random seed for reproducibility
    random.seed(seed)
    
    # Tokenize the dataset
    tokenized_dataset = dataset.map(
        lambda examples: tokenize_function(examples, tokenizer, max_length, use_robust_format),
        batched=True,
        remove_columns=dataset.column_names
    )
    
    # Split into train and eval
    total_size = len(tokenized_dataset)
    train_size = int(train_split * total_size)
    eval_size = total_size - train_size
    
    # Create train/eval splits
    train_dataset = tokenized_dataset.select(range(train_size))
    eval_dataset = tokenized_dataset.select(range(train_size, total_size))
    
    return train_dataset, eval_dataset

def create_sample_data(num_examples: int = 10) -> Dataset:
    """
    Create sample training data for testing purposes.
    
    Args:
        num_examples: Number of examples to create
        
    Returns:
        Dataset with sample training data
    """
    sample_data = []
    
    themes = [
        "body_image, self_worth",
        "perfectionism, control", 
        "relationships, vulnerability",
        "recovery_values, motivation",
        "emotional_avoidance, insight"
    ]
    
    responses = [
        "What would it feel like to offer yourself the same compassion you give others?",
        "Where does that need for control come from, and what might it be protecting you from?",
        "What would it be like to let someone see the real you, even just a little?",
        "What matters most to you right now, and how does recovery support that?",
        "What might those uncomfortable emotions be trying to tell you?"
    ]
    
    for i in range(num_examples):
        theme = themes[i % len(themes)]
        response = responses[i % len(responses)]
        
        sample_data.append({
            "prompt": f"Themes: {theme}",
            "response": response
        })
    
    return Dataset.from_list(sample_data)

def load_robust_dataset(path: str) -> Dataset:
    """
    Load robust training dataset that combines Reddit posts with synthetic responses.
    
    Args:
        path: Path to JSONL file containing robust training data
        
    Returns:
        Dataset object with 'prompt', 'response', 'topics', and 'source' columns
    """
    with open(path, "r") as f:
        lines = [json.loads(l) for l in f if l.strip()]
    return Dataset.from_list(lines)

def format_robust_prompt_response(example: Dict[str, Any]) -> str:
    """
    Format robust training example into a single training text.
    
    Args:
        example: Training example with 'prompt', 'response', and optional 'topics'
        
    Returns:
        Formatted text for training
    """
    prompt = example['prompt']
    response = example['response']
    
    # Add topic context if available
    if 'topics' in example and example['topics']:
        topic_info = f"Context: {', '.join(example['topics'].keys())}"
        prompt = f"{topic_info}\n{prompt}"
    
    return f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\nYou are a compassionate therapist using motivational interviewing techniques to help people with eating disorders. Respond with empathy and validation while guiding them toward self-reflection.<|eot_id|><|start_header_id|>user<|end_header_id|>\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n{response}<|eot_id|>"

