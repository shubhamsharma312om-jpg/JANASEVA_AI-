"""
Abstract Base Architecture for the JANASEVA AI Multilingual NLP Engine.
Phase 1 Rule: Do NOT implement fake AI functionality or hardcoded AI responses.
This module defines the typed contract that Phase 2 NLP models must implement.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class NLPAnalysisResult:
    """Typed output produced by the NLP pipeline for a citizen grievance message."""

    original_message: str
    detected_language: str  # 'en', 'te', 'hi'
    translated_message: Optional[str]
    predicted_category: str
    assigned_department: str
    priority: str  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    confidence_score: float


class BaseNLPPipeline(ABC):
    """
    Abstract interface for the 5-stage AI/ML pipeline:
    1. Language Identification (English, Telugu, Hindi)
    2. Multilingual Text Processing / Normalization (& optional translation)
    3. Grievance Classification (7 civic categories)
    4. Department Prediction (via configurable department_mapping.json)
    5. Priority Assessment (LOW, MEDIUM, HIGH, CRITICAL)
    """

    @abstractmethod
    def detect_language(self, text: str) -> str:
        """Identify whether the input text is English ('en'), Telugu ('te'), or Hindi ('hi')."""
        raise NotImplementedError

    @abstractmethod
    def preprocess_and_translate(self, text: str, source_lang: str) -> Optional[str]:
        """Normalize text and optionally translate regional scripts into canonical form."""
        raise NotImplementedError

    @abstractmethod
    def classify_grievance(self, text: str, lang: str) -> tuple[str, float]:
        """Return (predicted_category, confidence_score) in [0.0, 1.0]."""
        raise NotImplementedError

    @abstractmethod
    def assess_priority(self, text: str, category: str) -> str:
        """Evaluate urgency and severity to assign priority level."""
        raise NotImplementedError

    @abstractmethod
    def process(self, text: str) -> NLPAnalysisResult:
        """Execute the complete end-to-end NLP pipeline."""
        raise NotImplementedError
