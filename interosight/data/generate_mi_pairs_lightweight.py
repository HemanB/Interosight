#!/usr/bin/env python3
"""
Lightweight MI response generator optimized for lower computational resources.
"""

import argparse
import json
import logging
import torch
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from tqdm import tqdm

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

MI_SYSTEM_PROMPT = """You are a compassionate, emotionally intelligent assistant trained to respond to Reddit posts about dieting, body image, or general struggles. Use motivational interviewing (MI) to validate emotions, explore ambivalence, and support recovery from disordered eating. Be nonjudgmental, natural, and human — never repetitive or robotic.

Instructions:

Respond with warmth and curiosity.

Vary tone and phrasing to avoid sounding scripted.

Use 2–5 sentence replies that invite reflection or continued sharing.

Reflect feelings, ask open questions, offer gentle reframes.

If post isn't ED-related, still respond supportively — be flexible and engaging.

Avoid: direct advice, clichés, therapy-speak, or overused MI templates.

Your goal: foster connection, support recovery, and keep the user engaged."""

class LightweightMIGenerator:
    def __init__(self, model_name: str = "meta-llama/Meta-Llama-3.1-8B-Instruct", device: str = "auto"):
        self.model_name = model_name
        self.device = device
        
        logger.info(f"Loading Llama 3.1 8B Instruct with CPU offloading: {model_name}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        # Configure 4-bit quantization for memory efficiency
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16
        )
        
        # Custom device map to offload most layers to CPU
        device_map = {
            "model.embed_tokens": 0,
            "model.norm": 0,
            "lm_head": 0,
            "model.layers.0": 0,
            "model.layers.1": 0,
            "model.layers.2": 0,
            "model.layers.3": 0,
            "model.layers.4": 0,
            "model.layers.5": 0,
            "model.layers.6": 0,
            "model.layers.7": 0,
            "model.layers.8": 0,
            "model.layers.9": 0,
            "model.layers.10": 0,
            "model.layers.11": 0,
            "model.layers.12": 0,
            "model.layers.13": 0,
            "model.layers.14": 0,
            "model.layers.15": 0,
            "model.layers.16": 0,
            "model.layers.17": 0,
            "model.layers.18": 0,
            "model.layers.19": 0,
            "model.layers.20": 0,
            "model.layers.21": 0,
            "model.layers.22": 0,
            "model.layers.23": 0,
            "model.layers.24": 0,
            "model.layers.25": 0,
            "model.layers.26": 0,
            "model.layers.27": 0,
            "model.layers.28": 0,
            "model.layers.29": 0,
            "model.layers.30": 0,
            "model.layers.31": 0,
        }
        
        # Load model with 4-bit quantization and CPU offloading
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=bnb_config,
            device_map=device_map,
            low_cpu_mem_usage=True,
            torch_dtype=torch.bfloat16,
            trust_remote_code=True
        )
        self.model.eval()
        
        logger.info("Llama 3.1 8B Instruct model loaded successfully with CPU offloading")
    
    def format_prompt(self, user_input: str) -> str:
        # More focused prompt for concise, validating responses
        return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a compassionate therapist using motivational interviewing to help people with eating disorders. Your responses should:

1. Show empathy and validate their feelings (1-2 sentences)
2. Use reflective listening to show understanding (1 sentence)
3. Ask 1 gentle, open-ended question that encourages self-reflection
4. Keep responses to 3-4 sentences total
5. Be specific to what they shared
6. Avoid multiple questions - only ask ONE question

Respond in a warm, caring tone that builds trust.

<|eot_id|><|start_header_id|>user<|end_header_id|>

{user_input}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""
    
    def generate_response(self, user_input: str, max_length: int = 420, temperature: float = 0.8) -> str:
        prompt = self.format_prompt(user_input)
        
        inputs = self.tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=150,  # Reduced for more concise responses
                temperature=temperature,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
                repetition_penalty=1.1,
                no_repeat_ngram_size=3,
                early_stopping=False,
            )
        
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the assistant response - everything after the last assistant header
        if "assistant<|end_header_id|>" in generated_text:
            response = generated_text.split("assistant<|end_header_id|>")[-1].strip()
        else:
            response = generated_text.strip()
        
        # Clean up any remaining special tokens
        response = response.replace("<|begin_of_text|>", "").replace("<|start_header_id|>", "").replace("<|end_header_id|>", "").replace("<|eot_id|>", "").strip()
        
        # Remove any system prompt content that leaked through
        if "You are a compassionate therapist" in response:
            # Find where the actual response starts (after the system prompt)
            lines = response.split('\n')
            clean_lines = []
            skip_until_response = True
            
            for line in lines:
                if "You are a compassionate therapist" in line:
                    skip_until_response = True
                    continue
                elif skip_until_response and line.strip() and not any(keyword in line.lower() for keyword in ['system', 'user', 'assistant', '1.', '2.', '3.', '4.', '5.', '6.', 'respond in a warm']):
                    skip_until_response = False
                
                if not skip_until_response:
                    clean_lines.append(line)
            
            response = ' '.join(clean_lines).strip()
        
        # Remove any remaining system/user content
        if "system" in response.lower() or "user" in response.lower():
            # Try to extract only the actual response part
            lines = response.split('\n')
            clean_lines = []
            for line in lines:
                if not any(keyword in line.lower() for keyword in ['system', 'user', 'assistant']):
                    clean_lines.append(line)
            response = ' '.join(clean_lines).strip()
        
        # Only use fallback if response is extremely short or clearly broken
        if len(response.split()) < 5 or response.lower().startswith("i understand"):
            # Try to generate again with different parameters
            with torch.no_grad():
                outputs2 = self.model.generate(
                    **inputs,
                    max_new_tokens=100,
                    temperature=0.9,
                    top_p=0.95,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.05,
                    no_repeat_ngram_size=2,
                    early_stopping=False,
                )
            
            generated_text2 = self.tokenizer.decode(outputs2[0], skip_special_tokens=True)
            if "assistant<|end_header_id|>" in generated_text2:
                response2 = generated_text2.split("assistant<|end_header_id|>")[-1].strip()
            else:
                response2 = generated_text2.strip()
            
            response2 = response2.replace("<|begin_of_text|>", "").replace("<|start_header_id|>", "").replace("<|end_header_id|>", "").replace("<|eot_id|>", "").strip()
            
            if len(response2.split()) > len(response.split()):
                response = response2
        
        return response
    
    def batch_generate(self, user_inputs: List[str], batch_size: int = 1, **kwargs) -> List[str]:
        responses = []
        
        # Single item processing for maximum memory efficiency with DialoGPT
        for i in tqdm(range(0, len(user_inputs), batch_size), desc="Generating MI responses"):
            batch = user_inputs[i:i + batch_size]
            batch_responses = []
            
            for user_input in batch:
                try:
                    response = self.generate_response(user_input, **kwargs)
                    batch_responses.append(response)
                    time.sleep(0.2)  # Delay for memory management
                    
                except Exception as e:
                    logger.warning(f"Failed to generate response: {e}")
                    batch_responses.append("I hear you. Could you tell me more about that?")
            
            responses.extend(batch_responses)
            
            # Clear GPU cache after every batch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        
        return responses

def generate_mi_pairs_lightweight(input_path: str, output_path: str, 
                                model_name: str = "meta-llama/Meta-Llama-3.1-8B-Instruct",
                                sample_size: Optional[int] = None, 
                                batch_size: int = 1,
                                start_from: int = 0) -> None:
    logger.info(f"Loading conversations from {input_path}")
    
    conversations = []
    with open(input_path, 'r') as f:
        for line in f:
            conversations.append(json.loads(line.strip()))
    
    conversations = conversations[start_from:]
    if sample_size:
        conversations = conversations[:sample_size]
    
    logger.info(f"Processing {len(conversations)} conversations starting from index {start_from}")
    
    generator = LightweightMIGenerator(model_name=model_name)
    
    logger.info("Generating MI responses...")
    user_inputs = [conv['user_input'] for conv in conversations]
    
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Check if we're resuming from a previous run
    existing_pairs = []
    if output_path.exists() and start_from > 0:
        logger.info(f"Found existing output file, loading {start_from} existing pairs")
        with open(output_path, 'r') as f:
            for line in f:
                existing_pairs.append(json.loads(line.strip()))
    
    training_pairs = existing_pairs.copy()
    
    # Process in batches with incremental saving
    save_interval = 100  # Save every 100 responses
    
    for i in tqdm(range(0, len(user_inputs), batch_size), desc="Generating MI responses"):
        batch = user_inputs[i:i + batch_size]
        batch_conversations = conversations[i:i + batch_size]
        batch_responses = []
        
        for user_input in batch:
            try:
                response = generator.generate_response(user_input)
                batch_responses.append(response)
                time.sleep(0.2)  # Delay for memory management
                
            except Exception as e:
                logger.warning(f"Failed to generate response: {e}")
                batch_responses.append("I hear you. Could you tell me more about that?")
        
        # Add batch results to training pairs
        for conv, response in zip(batch_conversations, batch_responses):
            training_pair = {
                'id': conv['id'],
                'user_input': conv['user_input'],
                'mi_response': response,
                'source': conv['source'],
                'metadata': conv.get('metadata', {})
            }
            training_pairs.append(training_pair)
        
        # Save incrementally every save_interval responses
        if len(training_pairs) % save_interval == 0:
            logger.info(f"Saving progress: {len(training_pairs)} pairs processed")
            with open(output_path, 'w') as f:
                for pair in training_pairs:
                    f.write(json.dumps(pair) + '\n')
        
        # Clear GPU cache after every batch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    
    # Final save
    with open(output_path, 'w') as f:
        for pair in training_pairs:
            f.write(json.dumps(pair) + '\n')
    
    logger.info(f"Saved {len(training_pairs)} MI training pairs to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Generate lightweight MI response pairs")
    parser.add_argument("--input", type=str, required=True, help="Path to input conversations JSONL file")
    parser.add_argument("--output", type=str, required=True, help="Path to output MI pairs JSONL file")
    parser.add_argument("--model_name", type=str, default="meta-llama/Meta-Llama-3.1-8B-Instruct", help="Model to use")
    parser.add_argument("--sample_size", type=int, default=None, help="Number of conversations to process")
    parser.add_argument("--batch_size", type=int, default=1, help="Batch size for processing")
    parser.add_argument("--start_from", type=int, default=0, help="Index to start processing from")
    
    args = parser.parse_args()
    
    generate_mi_pairs_lightweight(
        args.input, 
        args.output, 
        model_name=args.model_name,
        sample_size=args.sample_size,
        batch_size=args.batch_size,
        start_from=args.start_from
    )

if __name__ == "__main__":
    main()
