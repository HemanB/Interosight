#!/usr/bin/env python3
# interosight/training/train.py

import argparse
import logging
import os
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
from .data_loader import load_synthetic_dataset, prepare_training_data

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def setup_training_args(output_dir: str = "interosight/logs/training",
                       num_epochs: int = 3,
                       batch_size: int = 4,
                       learning_rate: float = 2e-4,
                       warmup_steps: int = 100):
    """Setup training arguments for the model."""
    
    os.makedirs(output_dir, exist_ok=True)
    
    return TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        gradient_accumulation_steps=4,
        learning_rate=learning_rate,
        warmup_steps=warmup_steps,
        logging_steps=10,
        save_steps=500,
        eval_steps=500,
        evaluation_strategy="steps",
        save_strategy="steps",
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        fp16=True,
        dataloader_pin_memory=False,
        remove_unused_columns=False,
        report_to=None,  # Disable wandb/tensorboard for now
    )

def main():
    """Main training function."""
    parser = argparse.ArgumentParser(description="Train InteroSight model")
    parser.add_argument(
        "--data_path", 
        type=str, 
        default="interosight/data/synthetic/mi_training_data.jsonl",
        help="Path to training data"
    )
    parser.add_argument(
        "--model_name", 
        type=str, 
        default="meta-llama/Meta-Llama-3.1-8B-Instruct",
        help="Base model to fine-tune"
    )
    parser.add_argument(
        "--output_dir", 
        type=str, 
        default="interosight/logs/training",
        help="Output directory for training logs and checkpoints"
    )
    parser.add_argument(
        "--num_epochs", 
        type=int, 
        default=3,
        help="Number of training epochs"
    )
    parser.add_argument(
        "--batch_size", 
        type=int, 
        default=4,
        help="Training batch size"
    )
    parser.add_argument(
        "--learning_rate", 
        type=float, 
        default=2e-4,
        help="Learning rate"
    )
    parser.add_argument(
        "--max_length", 
        type=int, 
        default=512,
        help="Maximum sequence length"
    )
    
    args = parser.parse_args()
    
    # Check CUDA availability
    logger.info(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
    
    # Load dataset
    logger.info(f"Loading dataset from {args.data_path}")
    dataset = load_synthetic_dataset(args.data_path)
    logger.info(f"Loaded {len(dataset)} examples")
    
    # Load model and tokenizer
    logger.info(f"Loading model: {args.model_name}")
    model, tokenizer = get_peft_model(args.model_name)
    logger.info("Model and tokenizer loaded successfully")
    
    # Prepare training data
    logger.info("Preparing training data...")
    train_dataset, eval_dataset = prepare_training_data(
        dataset, 
        tokenizer, 
        max_length=args.max_length,
        train_split=0.9
    )
    logger.info(f"Training examples: {len(train_dataset)}")
    logger.info(f"Evaluation examples: {len(eval_dataset)}")
    
    # Setup training arguments
    training_args = setup_training_args(
        output_dir=args.output_dir,
        num_epochs=args.num_epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate
    )
    
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
    final_model_path = os.path.join(args.output_dir, "final_model")
    trainer.save_model(final_model_path)
    tokenizer.save_pretrained(final_model_path)
    logger.info(f"Model saved to {final_model_path}")
    
    # Evaluate final model
    logger.info("Evaluating final model...")
    eval_results = trainer.evaluate()
    logger.info(f"Final evaluation results: {eval_results}")

if __name__ == "__main__":
    main()
