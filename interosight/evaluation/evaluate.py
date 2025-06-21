#!/usr/bin/env python3
# interosight/evaluation/evaluate.py

import argparse
import json
import logging
from pathlib import Path
from typing import List, Dict, Any
from ..models.inference import InteroSightInference
from ..training.data_loader import create_sample_data

logger = logging.getLogger(__name__)

class InteroSightEvaluator:
    """Evaluator for InteroSight model performance."""
    
    def __init__(self, model: InteroSightInference):
        """
        Initialize the evaluator.
        
        Args:
            model: Loaded InteroSight model
        """
        self.model = model
    
    def evaluate_sample_inputs(self) -> List[Dict[str, str]]:
        """
        Evaluate model on sample inputs.
        
        Returns:
            List of input-output pairs
        """
        sample_inputs = [
            "I'm feeling really down about my body today. Nothing fits right and I feel like everyone is judging me.",
            "I know I should eat more, but I'm scared of gaining weight. What if I can't stop?",
            "My therapist says I need to work on self-compassion, but I don't even know what that means.",
            "I want to recover, but part of me is afraid to let go of my eating disorder. It's been with me for so long.",
            "I had a really good day yesterday, but today I'm back to feeling worthless. Why can't I just stay positive?",
            "My family keeps telling me to 'just eat normally' but they don't understand how hard this is.",
            "I'm tired of fighting with food and my body every single day. I just want peace.",
            "What if I'm not sick enough to deserve help? Other people have it so much worse than me."
        ]
        
        results = []
        for user_input in sample_inputs:
            try:
                response = self.model.generate_response(user_input)
                results.append({
                    "user_input": user_input,
                    "model_response": response
                })
                logger.info(f"Generated response for: {user_input[:50]}...")
            except Exception as e:
                logger.error(f"Error generating response: {e}")
                results.append({
                    "user_input": user_input,
                    "model_response": f"ERROR: {str(e)}"
                })
        
        return results
    
    def evaluate_themes(self) -> Dict[str, List[Dict[str, str]]]:
        """
        Evaluate model responses across different psychological themes.
        
        Returns:
            Dictionary mapping themes to input-output pairs
        """
        theme_inputs = {
            "body_image": [
                "I can't stand looking at myself in the mirror",
                "My clothes don't fit the way they used to"
            ],
            "self_worth": [
                "I feel like I'm not good enough",
                "I don't deserve to take up space"
            ],
            "perfectionism": [
                "I have to get everything right or I'm a failure",
                "If I'm not perfect, what's the point?"
            ],
            "relationships": [
                "I'm afraid to let people get close to me",
                "What if they see the real me and leave?"
            ],
            "recovery_motivation": [
                "I want to change but I'm scared",
                "What if recovery doesn't work for me?"
            ]
        }
        
        results = {}
        for theme, inputs in theme_inputs.items():
            theme_results = []
            for user_input in inputs:
                try:
                    response = self.model.generate_response(user_input)
                    theme_results.append({
                        "user_input": user_input,
                        "model_response": response
                    })
                except Exception as e:
                    logger.error(f"Error generating response for theme {theme}: {e}")
                    theme_results.append({
                        "user_input": user_input,
                        "model_response": f"ERROR: {str(e)}"
                    })
            results[theme] = theme_results
        
        return results
    
    def save_evaluation_results(self, 
                               results: List[Dict[str, str]], 
                               output_path: str = "interosight/evaluation/examples/evaluation_results.json"):
        """
        Save evaluation results to file.
        
        Args:
            results: Evaluation results to save
            output_path: Path to save results
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"Evaluation results saved to {output_path}")
    
    def print_evaluation_summary(self, results: List[Dict[str, str]]):
        """
        Print a summary of evaluation results.
        
        Args:
            results: Evaluation results
        """
        print("\n" + "="*80)
        print("INTEROSIGHT EVALUATION SUMMARY")
        print("="*80)
        
        successful_responses = [r for r in results if not r["model_response"].startswith("ERROR")]
        error_count = len(results) - len(successful_responses)
        
        print(f"Total inputs evaluated: {len(results)}")
        print(f"Successful responses: {len(successful_responses)}")
        print(f"Errors: {error_count}")
        print(f"Success rate: {len(successful_responses)/len(results)*100:.1f}%")
        
        if successful_responses:
            avg_response_length = sum(len(r["model_response"]) for r in successful_responses) / len(successful_responses)
            print(f"Average response length: {avg_response_length:.0f} characters")
        
        print("\nSample Responses:")
        print("-" * 40)
        for i, result in enumerate(results[:3]):  # Show first 3
            print(f"\n{i+1}. User: {result['user_input'][:100]}...")
            print(f"   Model: {result['model_response'][:200]}...")

def main():
    """Main evaluation function."""
    parser = argparse.ArgumentParser(description="Evaluate InteroSight model")
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
        "--output_file", 
        type=str, 
        default="interosight/evaluation/examples/evaluation_results.json",
        help="Output file for evaluation results"
    )
    parser.add_argument(
        "--evaluate_themes", 
        action="store_true",
        help="Evaluate across different psychological themes"
    )
    
    args = parser.parse_args()
    
    # Initialize model
    logger.info("Loading model for evaluation...")
    model = InteroSightInference(
        base_model_name=args.base_model,
        adapter_path=args.model_path
    )
    
    # Initialize evaluator
    evaluator = InteroSightEvaluator(model)
    
    # Run evaluation
    if args.evaluate_themes:
        logger.info("Evaluating across themes...")
        results = evaluator.evaluate_themes()
        # Flatten results for saving
        flat_results = []
        for theme, theme_results in results.items():
            for result in theme_results:
                result["theme"] = theme
                flat_results.append(result)
    else:
        logger.info("Running sample evaluation...")
        flat_results = evaluator.evaluate_sample_inputs()
    
    # Save results
    evaluator.save_evaluation_results(flat_results, args.output_file)
    
    # Print summary
    evaluator.print_evaluation_summary(flat_results)

if __name__ == "__main__":
    main() 