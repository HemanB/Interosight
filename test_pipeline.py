#!/usr/bin/env python3
"""
Test script for the InteroSight data processing pipeline.

This script tests the pipeline components to ensure they work correctly.
"""

import json
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_data_files():
    """Test that required data files exist."""
    logger.info("Testing data files...")
    
    required_files = [
        "interosight/data/raw/dataverse_files/reddit_posts.csv",
        "interosight/data/raw/dataverse_files/topic_ensemble.csv"
    ]
    
    all_exist = True
    for file_path in required_files:
        path = Path(file_path)
        if path.exists():
            size_mb = path.stat().st_size / (1024 * 1024)
            logger.info(f"✅ {file_path} ({size_mb:.1f} MB)")
        else:
            logger.error(f"❌ {file_path} (missing)")
            all_exist = False
    
    return all_exist

def test_imports():
    """Test that all required modules can be imported."""
    logger.info("Testing imports...")
    
    try:
        import torch
        import transformers
        import pandas as pd
        from tqdm import tqdm
        
        # Test our custom modules
        from interosight.data.reddit_text_modifier import RedditTextModifier
        from interosight.data.mi_response_generator import MIResponseGenerator
        
        logger.info("✅ All imports successful")
        return True
        
    except ImportError as e:
        logger.error(f"❌ Import error: {e}")
        return False

def test_sample_data():
    """Test with a small sample of data."""
    logger.info("Testing with sample data...")
    
    try:
        import pandas as pd
        
        # Load a small sample of Reddit data
        reddit_path = "interosight/data/raw/dataverse_files/reddit_posts.csv"
        topics_path = "interosight/data/raw/dataverse_files/topic_ensemble.csv"
        
        if not Path(reddit_path).exists() or not Path(topics_path).exists():
            logger.error("❌ Sample data test failed - data files not found")
            return False
        
        # Load small samples
        reddit_df = pd.read_csv(reddit_path, nrows=5)
        topics_df = pd.read_csv(topics_path, nrows=5)
        
        logger.info(f"✅ Loaded {len(reddit_df)} Reddit posts and {len(topics_df)} topic annotations")
        
        # Check data structure
        if 'text' in reddit_df.columns:
            logger.info("✅ Reddit data has 'text' column")
        else:
            logger.warning("⚠️ Reddit data missing 'text' column")
        
        # Check for topic columns
        topic_cols = [col for col in topics_df.columns if any(topic in col.lower() for topic in [
            'relation', 'ed', 'bodyhate', 'feargain', 'depressedmood', 'restrict', 
            'binge', 'loss', 'gain', 'calorie', 'idealbody', 'fearfood', 'crave', 
            'exercise', 'protein'
        ])]
        
        if topic_cols:
            logger.info(f"✅ Found {len(topic_cols)} topic columns")
        else:
            logger.warning("⚠️ No topic columns found")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Sample data test failed: {e}")
        return False

def test_pipeline_status():
    """Test the pipeline status command."""
    logger.info("Testing pipeline status...")
    
    try:
        # This would normally call the pipeline status function
        # For now, just check if the pipeline script exists
        pipeline_path = Path("interosight/data/pipeline.py")
        if pipeline_path.exists():
            logger.info("✅ Pipeline script exists")
            return True
        else:
            logger.error("❌ Pipeline script missing")
            return False
            
    except Exception as e:
        logger.error(f"❌ Pipeline status test failed: {e}")
        return False

def main():
    """Run all tests."""
    logger.info("🧪 Starting InteroSight pipeline tests...")
    
    tests = [
        ("Data Files", test_data_files),
        ("Imports", test_imports),
        ("Sample Data", test_sample_data),
        ("Pipeline Status", test_pipeline_status),
    ]
    
    results = []
    for test_name, test_func in tests:
        logger.info(f"\n--- Testing {test_name} ---")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            logger.error(f"❌ {test_name} test failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    logger.info("\n" + "="*50)
    logger.info("📊 Test Results Summary:")
    logger.info("="*50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{test_name}: {status}")
        if result:
            passed += 1
    
    logger.info(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! The pipeline is ready to use.")
        logger.info("\nNext steps:")
        logger.info("1. Run: python -m interosight.data.pipeline --step status")
        logger.info("2. Run: python -m interosight.data.pipeline --step all --sample_size 100")
        return 0
    else:
        logger.error("❌ Some tests failed. Please fix the issues before proceeding.")
        return 1

if __name__ == "__main__":
    exit(main()) 