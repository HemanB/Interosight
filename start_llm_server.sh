#!/bin/bash

echo "Starting Intero LLM Server..."
echo "This will load the llama-3.2-1b model locally"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed"
    exit 1
fi

# Install requirements if needed
echo "Installing/updating dependencies..."
pip3 install -r llm_server_requirements.txt

# Start the server
echo ""
echo "Starting LLM server on http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

python3 llm_server.py 