# InteroSight

Fine-tuning an open-source LLM to deliver evidence-based interventions (cognitive flexibility, emotion regulation, values work, motivational interviewing) for eating-disorder recovery.

## Project Overview

InteroSight is an LLM-based system that takes user input (similar to Reddit posts from eating disorder communities) and generates motivational interviewing responses that validate emotions and help users work through the underlying psychology of their disorder.

## Repository Structure

```
interosight/
├── data/                    # Data processing and management
│   ├── raw/                # Raw data files (Reddit posts, topic annotations)
│   ├── processed/          # Processed datasets ready for training
│   └── synthetic/          # Synthetic motivational interviewing training data
├── models/                 # Model definitions and training logic
│   ├── sft_model.py       # Supervised fine-tuning model setup
│   └── inference.py       # Model inference and response generation
├── training/               # Training scripts and utilities
│   ├── train.py           # Main training script
│   ├── data_loader.py     # Data loading utilities
│   └── configs/           # Training configurations
├── evaluation/             # Model evaluation and testing
│   ├── evaluate.py        # Evaluation metrics and testing
│   └── examples/          # Example outputs and test cases
├── utils/                  # Utility functions and helpers
├── docs/                   # Documentation and research notes
└── notebooks/              # Exploratory analysis (legacy)
```

## Quick Start

1. **Setup Environment**:
   ```bash
   conda activate interosight
   pip install -r requirements.txt
   ```

2. **Process Data**:
   ```bash
   python -m interosight.data.process_raw_data
   ```

3. **Train Model**:
   ```bash
   python -m interosight.training.train --config configs/training_config.yaml
   ```

4. **Generate Responses**:
   ```bash
   python -m interosight.models.inference --input "I'm struggling with body image today"
   ```

## Data Sources

- **Reddit Posts**: Real posts from eating disorder subreddits with topic annotations
- **Synthetic MI Data**: Generated motivational interviewing training pairs
- **Topic Annotations**: Multi-label topic scores from multiple LLMs and human annotators

## Model Architecture

- **Base Model**: Meta-Llama-3.1-8B-Instruct
- **Fine-tuning**: QLoRA with 4-bit quantization
- **Training**: Supervised fine-tuning on prompt-response pairs
- **Multi-label Conditioning**: Handles multiple psychological themes simultaneously

## Key Features

- **Emotion Validation**: Recognizes and validates user emotions
- **Motivational Interviewing**: Uses MI techniques to guide self-reflection
- **Multi-theme Support**: Addresses body image, self-worth, relationships, etc.
- **Clinical Sensitivity**: Designed for eating disorder recovery contexts
