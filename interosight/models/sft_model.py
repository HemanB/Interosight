from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, prepare_model_for_kbit_training
from peft import get_peft_model as apply_peft
import torch

def get_peft_model(model_name, config=None):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # Set padding token for Llama tokenizer
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        tokenizer.pad_token_id = tokenizer.eos_token_id

    quant_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
    )

    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=quant_config,
        device_map="auto",
        trust_remote_code=True,
        torch_dtype=torch.bfloat16,
    )

    model = prepare_model_for_kbit_training(model)

    # Use config if provided, otherwise use defaults
    if config and 'model' in config and 'lora' in config['model']:
        lora_config = config['model']['lora']
        peft_config = LoraConfig(
            r=lora_config.get('r', 8),
            lora_alpha=lora_config.get('lora_alpha', 32),
            target_modules=lora_config.get('target_modules', ["q_proj", "v_proj"]),
            lora_dropout=lora_config.get('lora_dropout', 0.05),
            bias=lora_config.get('bias', "none"),
            task_type=lora_config.get('task_type', "CAUSAL_LM")
        )
    else:
        # Default LoRA config
        peft_config = LoraConfig(
            r=8,
            lora_alpha=32,
            target_modules=["q_proj", "v_proj"],
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM"
        )

    peft_model = apply_peft(model, peft_config)
    return peft_model, tokenizer

