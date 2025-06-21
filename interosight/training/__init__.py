"""
Training scripts and utilities for InteroSight
"""

from .train import main as train
from .data_loader import load_synthetic_dataset

__all__ = ["train", "load_synthetic_dataset"] 