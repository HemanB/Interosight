#!/usr/bin/env python3
"""
Simple LLM server for Intero app development
Serves llama-3.2-1b model locally
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native app

# Global variables for model and tokenizer
model = None
tokenizer = None
device = None

def load_model():
    """Load the llama-3.2-1b model"""
    global model, tokenizer, device
    
    try:
        logger.info("Loading llama-3.2-1b model...")
        
        # Determine device
        if torch.cuda.is_available():
            device = torch.device("cuda")
            logger.info("Using CUDA device")
        else:
            device = torch.device("cpu")
            logger.info("Using CPU device")
        
        # You can change this to your preferred model path
        model_name = "meta-llama/Llama-2-7b-chat-hf"  # Fallback if llama-3.2-1b not available
        
        # Try to load llama-3.2-1b first
        try:
            model_name = "meta-llama/Llama-3.2-1B-Instruct"
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if device.type == "cuda" else torch.float32,
                device_map="auto" if device.type == "cuda" else None,
                trust_remote_code=True
            )
            
            # If using CPU, move model to CPU explicitly
            if device.type == "cpu":
                model = model.to(device)
                
            logger.info(f"Successfully loaded {model_name} on {device}")
        except Exception as e:
            logger.warning(f"Could not load llama-3.2-1b: {e}")
            logger.info("Falling back to llama-2-7b-chat-hf")
            
            model_name = "meta-llama/Llama-2-7b-chat-hf"
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if device.type == "cuda" else torch.float32,
                device_map="auto" if device.type == "cuda" else None,
                trust_remote_code=True
            )
            
            # If using CPU, move model to CPU explicitly
            if device.type == "cpu":
                model = model.to(device)
                
            logger.info(f"Successfully loaded {model_name} on {device}")
            
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "model_name": "llama-3.2-1b" if model else None,
        "device": str(device) if device else None
    })

@app.route('/generate', methods=['POST'])
def generate():
    """Generate text using the loaded model"""
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({"error": "Missing 'prompt' in request body"}), 400
        
        prompt = data['prompt']
        max_tokens = data.get('max_tokens', 500)
        temperature = data.get('temperature', 0.7)
        top_p = data.get('top_p', 0.9)
        
        logger.info(f"Generating response for prompt: {prompt[:100]}...")
        
        # Tokenize the input and move to correct device
        inputs = tokenizer(prompt, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Generate response
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode the response
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the generated part (remove the input prompt)
        generated_text = response[len(prompt):].strip()
        
        logger.info(f"Generated response: {generated_text[:100]}...")
        
        return jsonify({
            "response": generated_text,
            "model": "llama-3.2-1b",
            "prompt_length": len(prompt),
            "response_length": len(generated_text)
        })
        
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        return jsonify({
            "error": "Failed to generate response",
            "details": str(e)
        }), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List available models"""
    return jsonify({
        "models": ["llama-3.2-1b"],
        "current_model": "llama-3.2-1b"
    })

if __name__ == '__main__':
    # Load the model on startup
    load_model()
    
    # Run the server
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting LLM server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True) 