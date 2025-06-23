# InteroSight

Fine-tuning an open-source LLM to deliver evidence-based interventions (cognitive flexibility, emotion regulation, values work, motivational interviewing) for eating-disorder recovery.

## Project Overview

InteroSight is an LLM-based system that takes user input (similar to Reddit posts from eating disorder communities) and generates motivational interviewing responses that validate emotions and gently guide users to work through the underlying psychology of their disorder.

## Repository Structure

```
interosight/
├── data/                    # Data processing and management
│   ├── raw/                # Raw data files (Reddit posts, topic annotations)
│   │   └── dataverse_files/ # Original Reddit dataset from Qiu et al. 2025
│   ├── processed/          # Processed datasets ready for training
│   ├── synthetic/          # Synthetic motivational interviewing training data
│   ├── reddit_text_modifier.py      # Step 1: Fast regex-based text cleaning + relevance filtering
│   ├── mi_response_generator.py     # Step 2: LLM-based MI response generation
│   └── pipeline.py         # Main pipeline orchestrator with intelligent filtering
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

### 1. Setup Environment
```bash
conda activate interosight
pip install -r requirements.txt
```

### 2. Data Processing Pipeline
The pipeline has three main steps with intelligent filtering:

#### Step 1: Modify Raw Reddit Text (FAST - 30 minutes for full dataset)
Convert Reddit posts to one-on-one therapeutic conversation format with relevance filtering:
```bash
# Process high-relevance posts only (recommended)
python -m interosight.data.pipeline --step modify --min_relevance_score 0.5 --max_posts 10000

# Process all relevant posts
python -m interosight.data.pipeline --step modify --min_relevance_score 0.3
```

#### Step 2: Generate Synthetic MI Responses (IN PROGRESS)
Create motivational interviewing responses for the filtered conversations:
```bash
python -m interosight.data.pipeline --step generate --sample_size 1000
```

#### Step 3: Run Full Pipeline
Or run both steps together:
```bash
python -m interosight.data.pipeline --step all --min_relevance_score 0.5
```

#### Check Pipeline Status
```bash
python -m interosight.data.pipeline --step status
```

### 3. Train Model
```bash
python -m interosight.training.train --config configs/training_config.yaml
```

### 4. Generate Responses
```bash
python -m interosight.models.inference --input "I'm struggling with body image today"
```

## Data Processing Workflow

### Step 1: Intelligent Text Modification (`reddit_text_modifier.py`)
- **Input**: Raw Reddit posts from eating disorder communities
- **Process**: 
  - Fast regex-based cleaning (1000x faster than LLM approach)
  - Intelligent relevance scoring using topic annotations
  - Configurable filtering by clinical relevance
- **Output**: `modified_conversations.jsonl` with cleaned text and relevance scores

### Step 2: MI Response Generation (`mi_response_generator.py`)
- **Input**: Filtered conversations from Step 1
- **Process**: Uses Llama 3.1 to generate synthetic motivational interviewing responses
- **Output**: `mi_training_pairs.jsonl` with prompt-response pairs for fine-tuning

### Key Technical Features
- **Performance Optimized**: 99.6% faster processing (regex vs LLM)
- **Intelligent Filtering**: Relevance scoring prioritizes clinically valuable content
- **Authenticity Preserved**: Minimal text changes maintain original emotional voice
- **Scalable Architecture**: Batch processing handles large datasets efficiently
- **Quality Control**: Automated filtering for inappropriate content and length

## Data Sources

- **Synthetic MI Data**: Generated motivational interviewing training pairs using Llama 3.1
- **Reddit Posts With Topic Annotations**: Real posts from eating disorder subreddits with topic annotations from multiple LLMs and human annotators
  - Qiu, Jiaxing. 2025. "Topic Annotations on Reddit Posts from Eating Disorders and Dieting Forums by Human and LLMs." University of Virginia Dataverse. https://doi.org/doi:10.18130/V3/NENELT.

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
- **Performance Optimized**: Fast processing pipeline for large-scale datasets
- **Intelligent Filtering**: Relevance scoring for clinically valuable content

## Pipeline Configuration

### Command Line Options
- `--step`: Choose pipeline step (`modify`, `generate`, `all`, `status`)
- `--sample_size`: Number of samples to process (default: all)
- `--batch_size`: Batch size for processing (default: 1000 for modification)
- `--model_name`: Model to use (default: meta-llama/Meta-Llama-3.1-8B-Instruct)
- `--min_relevance_score`: Minimum relevance score to include (0-1, default: 0.3)
- `--max_posts`: Maximum number of posts to process (default: all)

### Example Usage
```bash
# Process high-relevance posts for quick testing
python -m interosight.data.pipeline --step all --min_relevance_score 0.7 --max_posts 1000

# Process full dataset with moderate relevance threshold
python -m interosight.data.pipeline --step all --min_relevance_score 0.5

# Check current pipeline status
python -m interosight.data.pipeline --step status
```

## Design Decisions & Technical Notes

**Performance Optimization**: Initial LLM-based approach would take 117+ hours. Switched to regex cleaning for 30-minute processing.

**Relevance Filtering**: Built scoring system using topic annotations to prioritize eating disorder and mental health content. Filters out general dieting/fitness posts.

**Authenticity**: Minimal text changes preserve original voice while removing Reddit-specific formatting.

**Modular Design**: Separate modules for cleaning, scoring, and processing. Configurable batch sizes and filtering thresholds.

**Current Status**: Phase 1 (data pipeline) complete. Phase 2 (MI response generation) in progress.
