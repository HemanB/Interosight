#!/usr/bin/env python3
"""
Example script demonstrating InteroSight usage.
"""

import logging
from interosight.models.inference import InteroSightInference

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Demonstrate InteroSight functionality."""
    
    # Initialize model (using base model for demo)
    logger.info("Initializing InteroSight model...")
    model = InteroSightInference()
    
    # Example user inputs
    example_inputs = [
        "I'm feeling really down about my body today. Nothing fits right and I feel like everyone is judging me.",
        "I want to recover, but part of me is afraid to let go of my eating disorder. It's been with me for so long.",
        "My family keeps telling me to 'just eat normally' but they don't understand how hard this is."
    ]
    
    print("\n" + "="*80)
    print("INTEROSIGHT DEMO")
    print("="*80)
    
    # Generate responses
    for i, user_input in enumerate(example_inputs, 1):
        print(f"\n{i}. User Input:")
        print(f"   {user_input}")
        
        try:
            response = model.generate_response(user_input)
            print(f"\n   InteroSight Response:")
            print(f"   {response}")
        except Exception as e:
            print(f"\n   Error generating response: {e}")
        
        print("-" * 80)
    
    print("\nDemo completed!")

if __name__ == "__main__":
    main() 