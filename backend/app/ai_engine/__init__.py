"""
Modular AI/NLP Engine Package for JANASEVA AI.
Phase 1 defines the strict architectural contracts and data structures so that
Phase 2 multilingual NLP models (English, Telugu, Hindi) can be plugged in cleanly
without altering API routes or database schemas.
"""

from app.ai_engine.base import BaseNLPPipeline, NLPAnalysisResult
from app.ai_engine.pipeline import Phase1ModularNLPPipeline

__all__ = ["BaseNLPPipeline", "NLPAnalysisResult", "Phase1ModularNLPPipeline"]
