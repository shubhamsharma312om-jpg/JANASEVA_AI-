"""
Phase 1 Modular NLP Pipeline Coordinator.
Strictly adheres to Phase 1 development rules:
- Does NOT implement fake AI functionality or hardcoded/simulated chatbot responses.
- Raises a clear Phase1NotImplementedError when live NLP inference is invoked before
  Phase 2 model weights/classifiers are integrated, while providing department lookup
  from the configurable mapping file.
"""

from typing import Dict
from app.ai_engine.base import BaseNLPPipeline, NLPAnalysisResult
from app.core.config import settings


class Phase1NotImplementedError(NotImplementedError):
    """Raised when Phase 2 NLP model inference is called during Phase 1 foundation."""


class Phase1ModularNLPPipeline(BaseNLPPipeline):
    """
    Phase 1 structural placeholder for the JANASEVA AI NLP Engine.
    Loads configurable category-to-department routing rules and defines the exact
    integration boundary for Phase 2 multilingual models.
    """

    def __init__(self) -> None:
        self.category_to_department: Dict[str, str] = (
            settings.get_category_to_department_map()
        )
        self.supported_languages = settings.SUPPORTED_LANGUAGES

    def resolve_department(self, predicted_category: str) -> str:
        """Map a predicted grievance category to its configured civic department."""
        return self.category_to_department.get(
            predicted_category, "Relevant Civic Authority"
        )

    def detect_language(self, text: str) -> str:
        raise Phase1NotImplementedError(
            "Language Identification model (en/te/hi) is scheduled for Phase 2 integration."
        )

    def preprocess_and_translate(self, text: str, source_lang: str) -> str | None:
        raise Phase1NotImplementedError(
            "Multilingual text normalization & translation is scheduled for Phase 2 integration."
        )

    def classify_grievance(self, text: str, lang: str) -> tuple[str, float]:
        raise Phase1NotImplementedError(
            "Multilingual Grievance Classifier is scheduled for Phase 2 integration."
        )

    def assess_priority(self, text: str, category: str) -> str:
        raise Phase1NotImplementedError(
            "Priority Assessment engine is scheduled for Phase 2 integration."
        )

    def process(self, text: str) -> NLPAnalysisResult:
        raise Phase1NotImplementedError(
            "Phase 1 Foundation: End-to-end NLP inference is deferred to Phase 2. "
            "No fake or hardcoded AI responses are permitted in Phase 1."
        )
