#!/usr/bin/env python3
"""
Test script for the Intero LLM server
"""

import requests
import json

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get('http://localhost:5000/health')
        print("Health Check:")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_generate():
    """Test the generate endpoint"""
    try:
        test_prompt = """You are the Stone of Wisdom, a compassionate AI companion in Intero - a reflective RPG for eating disorder recovery. Your role is to provide empathetic, non-judgmental support while maintaining therapeutic boundaries.

User: I'm feeling really overwhelmed today. How can I be kinder to myself?

Assistant: """

        data = {
            'prompt': test_prompt,
            'max_tokens': 200,
            'temperature': 0.7,
            'top_p': 0.9
        }
        
        response = requests.post('http://localhost:5000/generate', json=data)
        
        print("\nGenerate Test:")
        print(f"Status Code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
        
        return response.status_code == 200
    except Exception as e:
        print(f"Generate test failed: {e}")
        return False

def main():
    print("Testing Intero LLM Server...")
    print("=" * 40)
    
    # Test health endpoint
    health_ok = test_health()
    
    if health_ok:
        # Test generate endpoint
        generate_ok = test_generate()
        
        if generate_ok:
            print("\n✅ All tests passed! LLM server is working correctly.")
        else:
            print("\n❌ Generate test failed.")
    else:
        print("\n❌ Health check failed. Make sure the server is running.")

if __name__ == '__main__':
    main() 