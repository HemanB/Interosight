# InteroSight

AI-powered mobile health platform for interoceptive awareness and eating disorder recovery, featuring real-time meal tracking, trigger identification, and personalized insights.

## Overview

InteroSight combines a fine-tuned LLM with a React Native mobile app to deliver evidence-based interventions for eating disorder recovery. The system processes user input and generates motivational interviewing responses that validate emotions while guiding users through underlying psychological patterns.

## Architecture

### Mobile App
- **React Native with Expo** - Cross-platform mobile development
- **Firebase Backend** - Authentication, Firestore database, real-time features
- **Bottom Tab Navigation** - Home, Reflect (LLM chat), Meals, Triggers, Community, Settings
- **Mascot-driven UI** - Engaging interface with therapeutic animations

### AI Model
- **Base Model**: Meta-Llama-3.1-8B-Instruct
- **Fine-tuning**: QLoRA with 4-bit quantization
- **Training Data**: Reddit posts from eating disorder communities + synthetic MI responses
- **Multi-label Support**: Handles body image, self-worth, relationships simultaneously

## Key Features

### Mobile App
- **Reflect Screen**: LLM-powered therapeutic chat with empathetic mascot
- **Meal Logging**: Text-based food tracking with optional photos
- **Trigger Analysis**: Behavioral pattern tracking and crisis tools
- **Community Support**: Peer interaction and resource sharing
- **Crisis Safety**: Emergency contacts and mental health hotlines

### AI Pipeline
- **Intelligent Filtering**: Relevance scoring for clinically valuable content
- **Performance Optimized**: 99.6% faster processing (regex vs LLM)
- **Quality Control**: Automated filtering for inappropriate content
- **Scalable Processing**: Batch handling for large datasets

## Quick Start

### Environment Setup
```bash
conda activate interosight
pip install -r requirements.txt
```

### Data Processing
```bash
# Process high-relevance posts
python -m interosight.data.pipeline --step all --min_relevance_score 0.5 --max_posts 10000

# Check pipeline status
python -m interosight.data.pipeline --step status
```

### Model Training
```bash
python -m interosight.training.train --config configs/training_config.yaml
```

### Mobile App Development
```bash
cd app
npm install
npx expo start
```

## Data Sources

- **Reddit Posts**: Real posts from eating disorder subreddits with topic annotations
- **Synthetic MI Data**: Generated motivational interviewing responses using Llama 3.1
- **Reference**: Qiu, Jiaxing. 2025. "Topic Annotations on Reddit Posts from Eating Disorders and Dieting Forums by Human and LLMs." University of Virginia Dataverse.

## Repository Structure

```
interosight/
├── data/                   # Data processing pipeline
├── models/                 # Model definitions and inference
├── training/               # Training scripts and configs
├── evaluation/             # Model evaluation and testing
├── utils/                  # Utility functions
└── docs/                   # Documentation and flowcharts

app/                        # React Native mobile application
├── components/             # Reusable UI components
├── screens/               # Main app screens
├── navigation/            # React Navigation setup
├── lib/                   # Firebase and LLM integration
└── assets/                # Images, fonts, animations
```

## Technical Notes

- **Performance**: Regex-based text cleaning reduces processing time from 117+ hours to 30 minutes
- **Clinical Focus**: Designed specifically for eating disorder recovery contexts
- **Safety First**: Built-in crisis tools and emergency escalation procedures
- **Cross-platform**: Works on iOS, Android, and web

## Documentation

Detailed app flowcharts and screen layouts are available in `docs/`:
- `app_flowchart.puml` - Complete user journey diagram
- `screen_flow_diagram.puml` - Detailed UI component layouts

View with any PlantUML renderer.
