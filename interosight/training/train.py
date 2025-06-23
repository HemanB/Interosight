#!/usr/bin/env python3
# interosight/training/train.py

import argparse
import logging
import os
import yaml
import torch
from pathlib import Path
from transformers import (
    AutoTokenizer, 
    TrainingArguments, 
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig

from ..models.sft_model import get_peft_model
from .data_loader import load_synthetic_dataset, load_robust_dataset, prepare_training_data

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def load_config(config_path: str) -> dict:
    """Load configuration from YAML file."""
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Ensure numeric values are properly typed
    if 'data' in config:
        data_config = config['data']
        if 'max_length' in data_config:
            data_config['max_length'] = int(data_config['max_length'])
        if 'train_split' in data_config:
            data_config['train_split'] = float(data_config['train_split'])
        if 'seed' in data_config:
            data_config['seed'] = int(data_config['seed'])
    
    if 'training' in config:
        training_config = config['training']
        if 'num_epochs' in training_config:
            training_config['num_epochs'] = int(training_config['num_epochs'])
        if 'batch_size' in training_config:
            training_config['batch_size'] = int(training_config['batch_size'])
        if 'gradient_accumulation_steps' in training_config:
            training_config['gradient_accumulation_steps'] = int(training_config['gradient_accumulation_steps'])
        if 'learning_rate' in training_config:
            training_config['learning_rate'] = float(training_config['learning_rate'])
        if 'warmup_steps' in training_config:
            training_config['warmup_steps'] = int(training_config['warmup_steps'])
        if 'logging_steps' in training_config:
            training_config['logging_steps'] = int(training_config['logging_steps'])
        if 'save_steps' in training_config:
            training_config['save_steps'] = int(training_config['save_steps'])
        if 'eval_steps' in training_config:
            training_config['eval_steps'] = int(training_config['eval_steps'])
    
    if 'model' in config and 'lora' in config['model']:
        lora_config = config['model']['lora']
        if 'r' in lora_config:
            lora_config['r'] = int(lora_config['r'])
        if 'lora_alpha' in lora_config:
            lora_config['lora_alpha'] = int(lora_config['lora_alpha'])
        if 'lora_dropout' in lora_config:
            lora_config['lora_dropout'] = float(lora_config['lora_dropout'])
    
    return config

def setup_training_args(config: dict) -> TrainingArguments:
    """Setup training arguments from config."""
    
    training_config = config.get('training', {})
    output_config = config.get('output', {})
    
    output_dir = output_config.get('output_dir', 'interosight/logs/training')
    os.makedirs(output_dir, exist_ok=True)
    
    return TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=training_config.get('num_epochs', 3),
        per_device_train_batch_size=training_config.get('batch_size', 4),
        per_device_eval_batch_size=training_config.get('batch_size', 4),
        gradient_accumulation_steps=training_config.get('gradient_accumulation_steps', 4),
        learning_rate=training_config.get('learning_rate', 2e-4),
        warmup_steps=training_config.get('warmup_steps', 100),
        logging_steps=training_config.get('logging_steps', 10),
        save_steps=training_config.get('save_steps', 500),
        eval_steps=training_config.get('eval_steps', 500),
        eval_strategy="steps",
        save_strategy="steps",
        load_best_model_at_end=output_config.get('load_best_model_at_end', True),
        metric_for_best_model=output_config.get('metric_for_best_model', 'eval_loss'),
        greater_is_better=output_config.get('greater_is_better', False),
        fp16=training_config.get('fp16', True),
        dataloader_pin_memory=training_config.get('dataloader_pin_memory', False),
        remove_unused_columns=False,
        report_to=None,  # Disable wandb/tensorboard for now
    )

def setup_lora_config(config: dict) -> LoraConfig:
    """Setup LoRA configuration from config."""
    lora_config = config.get('model', {}).get('lora', {})
    
    return LoraConfig(
        r=lora_config.get('r', 8),
        lora_alpha=lora_config.get('lora_alpha', 32),
        target_modules=lora_config.get('target_modules', ["q_proj", "v_proj"]),
        lora_dropout=lora_config.get('lora_dropout', 0.05),
        bias=lora_config.get('bias', "none"),
        task_type=lora_config.get('task_type', "CAUSAL_LM")
    )

def main():
    """Main training function."""
    parser = argparse.ArgumentParser(description="Train InteroSight model")
    parser.add_argument(
        "--config", 
        type=str, 
        default="interosight/training/configs/training_config.yaml",
        help="Path to YAML config file"
    )
    parser.add_argument(
        "--data_path", 
        type=str, 
        help="Path to training data (overrides config)"
    )
    parser.add_argument(
        "--model_name", 
        type=str, 
        help="Base model to fine-tune (overrides config)"
    )
    parser.add_argument(
        "--output_dir", 
        type=str, 
        help="Output directory (overrides config)"
    )
    parser.add_argument(
        "--num_epochs", 
        type=int, 
        help="Number of training epochs (overrides config)"
    )
    parser.add_argument(
        "--batch_size", 
        type=int, 
        help="Training batch size (overrides config)"
    )
    parser.add_argument(
        "--learning_rate", 
        type=float, 
        help="Learning rate (overrides config)"
    )
    parser.add_argument(
        "--max_length", 
        type=int, 
        help="Maximum sequence length (overrides config)"
    )
    parser.add_argument(
        "--use_robust_data", 
        action="store_true",
        help="Use robust training data (Reddit + synthetic) instead of synthetic only"
    )
    parser.add_argument(
        "--robust_data_path", 
        type=str, 
        default="interosight/data/robust_training_data.jsonl",
        help="Path to robust training data (when using --use_robust_data)"
    )
    
    args = parser.parse_args()
    
    # Load config file
    logger.info(f"Loading config from {args.config}")
    config = load_config(args.config)
    
    # Override config with command-line arguments if provided
    if args.data_path:
        config['data']['train_path'] = args.data_path
    if args.model_name:
        config['model']['base_model'] = args.model_name
    if args.output_dir:
        config['output']['output_dir'] = args.output_dir
    if args.num_epochs:
        config['training']['num_epochs'] = args.num_epochs
    if args.batch_size:
        config['training']['batch_size'] = args.batch_size
    if args.learning_rate:
        config['training']['learning_rate'] = args.learning_rate
    if args.max_length:
        config['data']['max_length'] = args.max_length
    if args.use_robust_data:
        config['data']['use_robust_data'] = True
    if args.robust_data_path:
        config['data']['robust_data_path'] = args.robust_data_path
    
    # Check CUDA availability
    logger.info(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
    
    # Load dataset
    if config['data'].get('use_robust_data', False):
        data_path = config['data'].get('robust_data_path', 'interosight/data/robust_training_data.jsonl')
        logger.info(f"Loading robust dataset from {data_path}")
        dataset = load_robust_dataset(data_path)
        use_robust_format = True
    else:
        data_path = config['data']['train_path']
        logger.info(f"Loading synthetic dataset from {data_path}")
        dataset = load_synthetic_dataset(data_path)
        use_robust_format = False
    
    logger.info(f"Loaded {len(dataset)} examples")
    
    # Load model and tokenizer
    model_name = config['model']['base_model']
    logger.info(f"Loading model: {model_name}")
    model, tokenizer = get_peft_model(model_name, config)
    logger.info("Model and tokenizer loaded successfully")
    
    # Prepare training data
    logger.info("Preparing training data...")
    train_dataset, eval_dataset = prepare_training_data(
        dataset, 
        tokenizer, 
        max_length=config['data']['max_length'],
        train_split=config['data']['train_split'],
        seed=config['data']['seed'],
        use_robust_format=use_robust_format
    )
    logger.info(f"Training examples: {len(train_dataset)}")
    logger.info(f"Evaluation examples: {len(eval_dataset)}")
    
    # Setup training arguments
    training_args = setup_training_args(config)
    
    # Setup data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
    )
    
    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        data_collator=data_collator,
        tokenizer=tokenizer,
    )
    
    # Start training
    logger.info("Starting training...")
    trainer.train()
    
    # Save final model
    final_model_path = os.path.join(config['output']['output_dir'], "final_model")
    trainer.save_model(final_model_path)
    tokenizer.save_pretrained(final_model_path)
    logger.info(f"Model saved to {final_model_path}")
    
    # Evaluate final model
    logger.info("Evaluating final model...")
    eval_results = trainer.evaluate()
    logger.info(f"Final evaluation results: {eval_results}")

if __name__ == "__main__":
    main()
