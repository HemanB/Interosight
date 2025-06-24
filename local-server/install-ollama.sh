#!/bin/bash

# InteroSight Local LLM Setup Script
# Installs Ollama and downloads Llama 3.1 8B model

echo "🚀 Setting up InteroSight Local LLM Server..."

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed"
else
    echo "📦 Installing Ollama..."
    
    # Install Ollama
    curl -fsSL https://ollama.ai/install.sh | sh
    
    # Add Ollama to PATH if not already there
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
        export PATH="$HOME/.local/bin:$PATH"
    fi
fi

# Start Ollama service
echo "🔧 Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
echo "⏳ Waiting for Ollama to start..."
sleep 5

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running"
else
    echo "❌ Failed to start Ollama"
    exit 1
fi

# Download Llama 3.1 8B model
echo "📥 Downloading Llama 3.1 8B model (this may take a while)..."
ollama pull llama3.1:8b

# Check if model was downloaded successfully
if ollama list | grep -q "llama3.1:8b"; then
    echo "✅ Llama 3.1 8B model downloaded successfully"
else
    echo "❌ Failed to download model"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the local server: npm start"
echo "2. Update your mobile app to use local server"
echo "3. Test the connection: curl http://localhost:3001/health"
echo ""
echo "Server will be available at:"
echo "- Health check: http://localhost:3001/health"
echo "- Chat endpoint: http://localhost:3001/api/chat"
echo ""
echo "To stop Ollama: pkill ollama"
echo "To stop the server: Ctrl+C" 