#!/bin/bash

# InteroSight LLM Setup Script
# This script helps set up Ollama for local LLM integration

echo "InteroSight LLM Setup Script"
echo "============================"

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "Ollama is already installed"
    OLLAMA_VERSION=$(ollama --version)
    echo "Version: $OLLAMA_VERSION"
else
    echo "Installing Ollama..."
    
    # Detect OS and install Ollama
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Detected Linux"
        curl -fsSL https://ollama.ai/install.sh | sh
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Detected macOS"
        curl -fsSL https://ollama.ai/install.sh | sh
    else
        echo "Unsupported OS: $OSTYPE"
        echo "Please install Ollama manually from https://ollama.ai"
        exit 1
    fi
fi

# Start Ollama service
echo "Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
echo "Waiting for Ollama to start..."
sleep 5

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "Ollama is running on http://localhost:11434"
else
    echo "Failed to start Ollama"
    exit 1
fi

# List available models
echo "Available models:"
ollama list

# Ask user which model to pull
echo ""
echo "Which model would you like to use for InteroSight?"
echo "   1. llama3.2:1b (recommended - ~1.3GB)"
echo "   2. llama2:3b (good quality - ~2GB)"
echo "   3. llama2:7b (better quality - ~4GB)"
echo "   4. mistral:7b (good balance - ~4GB)"
echo "   5. Skip model download"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "Pulling llama3.2:1b..."
        ollama pull llama3.2:1b
        MODEL="llama3.2:1b"
        ;;
    2)
        echo "Pulling llama2:3b..."
        ollama pull llama2:3b
        MODEL="llama2:3b"
        ;;
    3)
        echo "Pulling llama2:7b..."
        ollama pull llama2:7b
        MODEL="llama2:7b"
        ;;
    4)
        echo "Pulling mistral:7b..."
        ollama pull mistral:7b
        MODEL="mistral:7b"
        ;;
    5)
        echo "Skipping model download"
        MODEL="llama3.2:1b"  # Default
        ;;
    *)
        echo "Invalid choice, using default (llama3.2:1b)"
        MODEL="llama3.2:1b"
        ;;
esac

# Update the LLM configuration
echo "Updating LLM configuration..."
cat > app/src/core/config/llm.config.ts << EOF
import { LLMConfig } from '../../services/chat/llm.service';

// Simple configuration for llama3.2:1b model
export const llmConfig: LLMConfig = {
  type: 'ollama',
  baseUrl: 'http://localhost:11434',
  model: '$MODEL',
  temperature: 0.7,
  maxTokens: 500,
};

// Function to get the configuration
export function getLLMConfig(): LLMConfig {
  return llmConfig;
}

// Function to update configuration at runtime
export function updateLLMConfig(newConfig: Partial<LLMConfig>): LLMConfig {
  return { ...llmConfig, ...newConfig };
}
EOF

echo "LLM configuration updated to use $MODEL"

# Test the model
echo "Testing the model..."
if ollama run $MODEL "Hello, I'm testing the model for InteroSight." > /dev/null 2>&1; then
    echo "Model test successful!"
else
    echo "Model test failed, but Ollama is running"
fi

echo ""
echo "Setup complete!"
echo "============================"
echo "Next steps:"
echo "   1. Start your InteroSight app: cd app && npm run web"
echo "   2. The chat will now use $MODEL for responses"
echo "   3. Keep Ollama running: ollama serve"
echo ""
echo "Useful commands:"
echo "   - Start Ollama: ollama serve"
echo "   - List models: ollama list"
echo "   - Pull new model: ollama pull <model>"
echo "   - Test model: ollama run <model> 'Hello'"
echo ""
echo "For more info: https://ollama.ai" 