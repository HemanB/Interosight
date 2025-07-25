# Multi-Label Conditioning Strategy

## Background

Our merged Dataverse dataset contains 15 topic-scores per post, produced by several LLMs and a human annotator. In early prototyping we considered two possible ways to condition our synthetic MI/MANTRA prompts:

1. **Single-label**: slice the data by one topic at a time (e.g. only “body_image”), generating separate pipelines and models per topic.  
2. **Multi-label**: for each post, bundle together all the topics for which it has a non-zero score, and generate one unified model that can address any combination of themes.

## Decision Criteria

| Criterion              | Single-label                             | Multi-label                                 |
|------------------------|------------------------------------------|---------------------------------------------|
| **Data coverage**      | Uses only a fraction of available labels | Leverages all topic annotations in every example |
| **Clinical realism**   | Artificially isolates co-occurring themes | Emulates true complexity |
| **Pipeline simplicity**| Requires separate data slices, scripts   | One pipeline, one prompt template           |
| **Model capacity**     | Risk of under-training on rare topics    | Minimizing risk of undertraining |
| **Maintenance**        | N models & eval scripts to maintain       | Single model & eval framework               |

Based on these factors, I opted for **multi-label conditioning**. This maximizes data usage, reflects the multi-faceted nature of eating-disorder conversation, and simplifies the end-to-end workflow.

## Implementation Plan

1. **Build `topics_list`** in `notebooks/02_prepare_training_data.ipynb`.  
2. **Prompt template** includes `topics_list` context.  
3. **Generate** all synthetic examples in one go (no topic-stratified slicing).  
4. **Fine-tune** with QLoRA on fused instruction–response pairs.  
5. **Evaluate** model’s responsiveness to arbitrary topic combinations.
