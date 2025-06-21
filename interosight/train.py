import torch
from transformers import AutoTokenizer
from interosight.models.sft_model import get_peft_model
from interosight.data.synthetic_loader import load_synthetic_dataset

def main():
    print("CUDA available:", torch.cuda.is_available())

    # Load dataset
    dataset = load_synthetic_dataset("datasets/mi_training_data.jsonl")
    print(f"Loaded {len(dataset)} examples")

    # Load model
    model, tokenizer = get_peft_model("meta-llama/Meta-Llama-3.1-8B-Instruct")
    print("Model and tokenizer loaded")

if __name__ == "__main__":
    main()
