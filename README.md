# InteroSight

Fine-tuning an open-source LLM to deliver evidence-based interventions (cognitive flexibility, emotion regulation, values work, motivational interviewing) for eating-disorder recovery.

## Project Overview

InteroSight is an LLM-based system that takes user input (similar to Reddit posts from eating disorder communities) and generates motivational interviewing responses that validate emotions and gently guide users to work through the underlying psychology of their disorder.

## Mobile App Design

InteroSight includes a React Native mobile application designed to provide a beautiful, engaging, and therapeutic experience for eating disorder recovery. The app features a mascot-driven interface similar to Duolingo, with empathetic animations and evidence-based interventions.

### App Architecture

```
app/
├── components/             # Reusable UI components
├── screens/               # Main app screens
├── navigation/            # React Navigation setup
├── hooks/                 # Custom React hooks
├── lib/                   # Firebase, LLM API integration
├── prompts/               # LLM prompt templates
├── predictive/            # Predictive engine
├── assets/                # Images, fonts, mascot animations
└── constants/             # Colors, themes, configuration
```

### User Journey & App Flow

The app follows a carefully designed user journey that prioritizes emotional safety, engagement, and therapeutic effectiveness:

#### App Launch Experience
- **Mascot Animation**: Similar to Duolingo, engaging mascot animation during app loading
- **Home Screen**: Features mascot with minimal animations, streak indicator, XP bar, and to-do list with XP rewards

#### Navigation Structure
The app uses a bottom tab navigation with 6 main sections:

1. **Home Tab** (Leftmost) - Dashboard with progress tracking
2. **Reflect Tab** - LLM-powered therapeutic chat
3. **Meal Logging Tab** - Food tracking with descriptive input
4. **Triggers/Patterns Tab** - Behavioral pattern tracking and crisis tools
5. **Community Tab** - Peer support features
6. **Settings/Help Tab** - App configuration and resources

### Core Features

#### 1. Reflect Screen (LLM Chat)
- **Intuitive Chat Interface**: Clean, therapeutic chat design
- **Empathetic Mascot**: Animated mascot with empathetic gestures (nodding, adjusting glasses)
- **Emotional Engagement**: Animations engineered to promote feelings of safety and being heard
- **Real-time Processing**: Mascot animations during LLM response generation

#### 2. Meal Logging
- **Textual Focus**: Large text input for detailed meal descriptions
- **Meal Type Toggles**: Icons for breakfast, lunch, dinner, snacks
- **Image Support**: Optional photo uploads
- **Non-judgmental Design**: Focus on description rather than calorie counting

#### 3. Triggers & Behavioral Patterns
- **Trigger Logging**: Track behavioral patterns and triggers
- **Crisis Tools**: DBT and emotional regulation techniques
- **Emergency Contacts**: Pre-made messages for quick support requests
- **Risk Escalation**: One-tap access to suicide/mental health hotlines
- **Post-crisis Reflection**: Adaptive tool selection based on user input

#### 4. Settings & Configuration
- **Notification Settings**: Customizable reminders and alerts
- **Community Settings**: Privacy and interaction preferences
- **LLM Settings**: Chat behavior and response customization
- **Theme Customization**: Color schemes and visual preferences
- **Mascot Settings**: Personalization options
- **Resources**: Curated high-value recovery resources
- **Crisis Settings**: Emergency contact and safety configuration

### Design Principles

- **Emotional Safety First**: All interactions designed to promote feelings of safety and support
- **Gamification**: Streaks, XP, and progress tracking to encourage engagement
- **Accessibility**: Easy navigation and clear visual hierarchy
- **Crisis Awareness**: Built-in safety tools and escalation procedures
- **Personalization**: Customizable experience to meet individual needs

### Technical Implementation

- **React Native with Expo**: Cross-platform mobile development
- **React Navigation**: Custom stack navigator for full design control
- **Firebase Integration**: Authentication, data storage, and real-time features
- **Hugging Face LLM API**: Integration with fine-tuned therapeutic model
- **Custom Animations**: Mascot animations and micro-interactions
- **Responsive Design**: Optimized for various screen sizes and orientations

### App Flow Documentation

Detailed flowcharts and screen layouts are available in the `docs/` directory:

- **`docs/app_flowchart.puml`**: Complete user journey and app flow diagram
- **`docs/screen_flow_diagram.puml`**: Detailed screen layouts and UI components

To view these diagrams:
1. Use a PlantUML viewer (VS Code extension, online viewer, or local installation)
2. Copy the `.puml` file content into the viewer
3. The diagrams will render showing the complete app structure and user flows

These flowcharts serve as the foundation for development and ensure all team members understand the intended user experience and technical architecture.

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
