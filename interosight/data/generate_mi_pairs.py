#!/usr/bin/env python3
"""
Generate motivational interviewing response pairs for InteroSight training.

This script takes processed Reddit conversations and generates MI responses
using a Llama model with a specific system prompt for eating disorder recovery.
"""

import argparse
import json
import logging
import torch
from pathlib import Path
from typing import List, Dict, Any, Optional
from transformers import AutoTokenizer, AutoModelForCausalLM
from tqdm import tqdm

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# System prompt for MI response generation
MI_SYSTEM_PROMPT = """You are a compassionate, emotionally intelligent assistant trained to respond to Reddit posts about dieting, body image, or general struggles. Use motivational interviewing (MI) to validate emotions, explore ambivalence, and support recovery from disordered eating. Be nonjudgmental, natural, and human — never repetitive or robotic.

Instructions:

Respond with warmth and curiosity.

Vary tone and phrasing to avoid sounding scripted.

Use 2–5 sentence replies that invite reflection or continued sharing.

Reflect feelings, ask open questions, offer gentle reframes.

If post isn't ED-related, still respond supportively — be flexible and engaging.

Avoid: direct advice, clichés, therapy-speak, or overused MI templates.

Your goal: foster connection, support recovery, and keep the user engaged."""

class MIGenerator:
    """Generate motivational interviewing responses using a language model."""
    
    def __init__(self, model_name: str = "meta-llama/Meta-Llama-3.1-8B-Instruct", device: str = "auto"):
        """
        Initialize the MI response generator.
        
        Args:
            model_name: Name of the model to use for generation
            device: Device to load the model on
        """
        self.model_name = model_name
        self.device = device
        
        logger.info(f"Loading model: {model_name}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.bfloat16,
            device_map=device,
            trust_remote_code=True
        )
        self.model.eval()
        
        logger.info("Model loaded successfully")
    
    def format_prompt(self, user_input: str) -> str:
        """
        Format the prompt for MI response generation.
        
        Args:
            user_input: The user's input text
            
        Returns:
            Formatted prompt string
        """
        return f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n{MI_SYSTEM_PROMPT}<|eot_id|><|start_header_id|>user<|end_header_id|>\n{user_input}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n"
    
    def generate_response(self, user_input: str, max_length: int = 256, temperature: float = 0.8) -> str:
        """
        Generate a motivational interviewing response.
        
        Args:
            user_input: The user's input text
            max_length: Maximum length of the response
            temperature: Sampling temperature for generation
            
        Returns:
            Generated MI response
        """
        prompt = self.format_prompt(user_input)
        
        # Tokenize input
        inputs = self.tokenizer(prompt, return_tensors="pt")
        inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
        
        # Generate response
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_length=max_length,
                temperature=temperature,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
            )
        
        # Decode and extract response
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the assistant response
        response_start = generated_text.find("<|start_header_id|>assistant<|end_header_id|>")
        if response_start != -1:
            response_start = generated_text.find("\n", response_start) + 1
            response = generated_text[response_start:].strip()
        else:
            response = generated_text.strip()
        
        return response
    
    def batch_generate(self, user_inputs: List[str], **kwargs) -> List[str]:
        """
        Generate responses for multiple inputs.
        
        Args:
            user_inputs: List of user input texts
            **kwargs: Additional arguments for generate_response
            
        Returns:
            List of generated responses
        """
        responses = []
        for user_input in tqdm(user_inputs, desc="Generating MI responses"):
            try:
                response = self.generate_response(user_input, **kwargs)
                responses.append(response)
            except Exception as e:
                logger.warning(f"Failed to generate response for input: {e}")
                responses.append("I hear you. Could you tell me more about that?")
        
        return responses

def generate_mi_pairs(input_path: str, output_path: str, model_name: str = "meta-llama/Meta-Llama-3.1-8B-Instruct", 
                     sample_size: Optional[int] = None, batch_size: int = 100) -> None:
    """
    Generate motivational interviewing response pairs.
    
    Args:
        input_path: Path to input conversations JSONL file
        output_path: Path to output MI pairs JSONL file
        model_name: Model to use for generation
        sample_size: Number of conversations to process (None for all)
        batch_size: Batch size for processing
    """
    logger.info(f"Loading conversations from {input_path}")
    
    # Load conversations
    conversations = []
    with open(input_path, 'r') as f:
        for line in f:
            conversations.append(json.loads(line.strip()))
    
    if sample_size:
        conversations = conversations[:sample_size]
        logger.info(f"Processing {len(conversations)} conversations")
    
    # Initialize generator
    generator = MIGenerator(model_name=model_name)
    
    # Generate responses
    logger.info("Generating MI responses...")
    user_inputs = [conv['user_input'] for conv in conversations]
    responses = generator.batch_generate(user_inputs)
    
    # Create training pairs
    training_pairs = []
    for conv, response in zip(conversations, responses):
        training_pair = {
            'id': conv['id'],
            'user_input': conv['user_input'],
            'mi_response': response,
            'source': conv['source'],
            'metadata': conv.get('metadata', {})
        }
        training_pairs.append(training_pair)
    
    # Save to JSONL
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        for pair in training_pairs:
            f.write(json.dumps(pair) + '\n')
    
    logger.info(f"Saved {len(training_pairs)} MI training pairs to {output_path}")

def main():
    """Main function for command-line usage."""
    parser = argparse.ArgumentParser(description="Generate MI response pairs for InteroSight")
    parser.add_argument(
        "--input", 
        type=str, 
        required=True,
        help="Path to input conversations JSONL file"
    )
    parser.add_argument(
        "--output", 
        type=str, 
        required=True,
        help="Path to output MI pairs JSONL file"
    )
    parser.add_argument(
        "--model_name", 
        type=str, 
        default="meta-llama/Meta-Llama-3.1-8B-Instruct",
        help="Model to use for generation"
    )
    parser.add_argument(
        "--sample_size", 
        type=int, 
        default=None,
        help="Number of conversations to process (default: all)"
    )
    parser.add_argument(
        "--batch_size", 
        type=int, 
        default=100,
        help="Batch size for processing"
    )
    
    args = parser.parse_args()
    
    generate_mi_pairs(
        args.input, 
        args.output, 
        model_name=args.model_name,
        sample_size=args.sample_size,
        batch_size=args.batch_size
    )

if __name__ == "__main__":
    main() 