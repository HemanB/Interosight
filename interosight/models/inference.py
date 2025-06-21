#!/usr/bin/env python3
# interosight/models/inference.py

import argparse
import logging
import torch
from typing import Optional, List
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

logger = logging.getLogger(__name__)

class InteroSightInference:
    """Inference class for InteroSight model."""
    
    def __init__(self, 
                 base_model_name: str = "meta-llama/Meta-Llama-3.1-8B-Instruct",
                 adapter_path: Optional[str] = None,
                 device: str = "auto"):
        """
        Initialize the inference model.
        
        Args:
            base_model_name: Name of the base model
            adapter_path: Path to the fine-tuned adapter weights
            device: Device to load the model on
        """
        self.base_model_name = base_model_name
        self.adapter_path = adapter_path
        self.device = device
        
        # Load tokenizer
        logger.info(f"Loading tokenizer: {base_model_name}")
        self.tokenizer = AutoTokenizer.from_pretrained(base_model_name)
        
        # Load model
        logger.info("Loading model...")
        if adapter_path:
            # Load fine-tuned model
            self.model = AutoModelForCausalLM.from_pretrained(
                base_model_name,
                torch_dtype=torch.bfloat16,
                device_map=device,
                trust_remote_code=True
            )
            self.model = PeftModel.from_pretrained(self.model, adapter_path)
            logger.info(f"Loaded fine-tuned model from {adapter_path}")
        else:
            # Load base model
            self.model = AutoModelForCausalLM.from_pretrained(
                base_model_name,
                torch_dtype=torch.bfloat16,
                device_map=device,
                trust_remote_code=True
            )
            logger.info("Loaded base model")
        
        self.model.eval()
    
    def format_user_input(self, user_text: str) -> str:
        """
        Format user input into the expected prompt format.
        
        Args:
            user_text: Raw user input text
            
        Returns:
            Formatted prompt for the model
        """
        return f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\nYou are a compassionate therapist using motivational interviewing techniques to help people with eating disorders. Respond with empathy and validation while guiding them toward self-reflection.<|eot_id|><|start_header_id|>user<|end_header_id|>\n{user_text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n"
    
    def generate_response(self, 
                         user_text: str,
                         max_length: int = 512,
                         temperature: float = 0.7,
                         top_p: float = 0.9,
                         do_sample: bool = True) -> str:
        """
        Generate a motivational interviewing response.
        
        Args:
            user_text: User's input text
            max_length: Maximum length of generated response
            temperature: Sampling temperature
            top_p: Top-p sampling parameter
            do_sample: Whether to use sampling
            
        Returns:
            Generated response
        """
        # Format input
        prompt = self.format_user_input(user_text)
        
        # Tokenize
        inputs = self.tokenizer(prompt, return_tensors="pt")
        inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
        
        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_length=max_length,
                temperature=temperature,
                top_p=top_p,
                do_sample=do_sample,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
            )
        
        # Decode response
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the assistant response
        response_start = generated_text.find("<|start_header_id|>assistant<|end_header_id|>")
        if response_start != -1:
            response_start = generated_text.find("\n", response_start) + 1
            response = generated_text[response_start:].strip()
        else:
            response = generated_text.strip()
        
        return response
    
    def batch_generate(self, 
                      user_texts: List[str],
                      **kwargs) -> List[str]:
        """
        Generate responses for multiple user inputs.
        
        Args:
            user_texts: List of user input texts
            **kwargs: Additional arguments for generate_response
            
        Returns:
            List of generated responses
        """
        responses = []
        for text in user_texts:
            response = self.generate_response(text, **kwargs)
            responses.append(response)
        return responses

def main():
    """Main function for command-line inference."""
    parser = argparse.ArgumentParser(description="Generate InteroSight responses")
    parser.add_argument(
        "--input", 
        type=str, 
        required=True,
        help="User input text"
    )
    parser.add_argument(
        "--model_path", 
        type=str, 
        default=None,
        help="Path to fine-tuned model adapter"
    )
    parser.add_argument(
        "--base_model", 
        type=str, 
        default="meta-llama/Meta-Llama-3.1-8B-Instruct",
        help="Base model name"
    )
    parser.add_argument(
        "--max_length", 
        type=int, 
        default=512,
        help="Maximum response length"
    )
    parser.add_argument(
        "--temperature", 
        type=float, 
        default=0.7,
        help="Sampling temperature"
    )
    
    args = parser.parse_args()
    
    # Initialize model
    model = InteroSightInference(
        base_model_name=args.base_model,
        adapter_path=args.model_path
    )
    
    # Generate response
    response = model.generate_response(
        args.input,
        max_length=args.max_length,
        temperature=args.temperature
    )
    
    print(f"User: {args.input}")
    print(f"InteroSight: {response}")

if __name__ == "__main__":
    main() 