"""
InteroSight: LLM-based motivational interviewing for eating disorder recovery
"""

__version__ = "0.1.0"
__author__ = "InteroSight Team"

from .models.sft_model import get_peft_model
from .training.data_loader import load_synthetic_dataset

__all__ = ["get_peft_model", "load_synthetic_dataset"]
