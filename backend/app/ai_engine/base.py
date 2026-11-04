"""
Base data structures and abstract contracts for the JANASEVA AI
Intelligent Grievance Understanding Engine (Phase 5 Upgrade).
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class NLPAnalysisResult:
    """Legacy Phase 1 typed output preserved for backward compatibility."""

    original_message: str
    detected_language: str
    translated_message: Optional[str]
    predicted_category: str
    assigned_department: str
    priority: str
    confidence_score: float


@dataclass
class ExtractedLocationData:
    village: Optional[str] = None
    town: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    mandal: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    street: Optional[str] = None
    house_number: Optional[str] = None
    landmark: Optional[str] = None
    pincode: Optional[str] = None
    additional_location_details: Optional[str] = None

    def to_dict(self) -> Dict[str, Optional[str]]:
        return asdict(self)

    def has_any_primary_location(self) -> bool:
        return any(
            [
                self.village,
                self.town,
                self.city,
                self.district,
                self.mandal,
                self.ward,
                self.area,
                self.street,
                self.landmark,
            ]
        )

    def has_settlement(self) -> bool:
        """True if village, town, or city is known."""
        return bool(self.village or self.town or self.city)

    def has_locality_or_street(self) -> bool:
        """True if area, street, or ward is known."""
        return bool(self.area or self.street or self.ward)


@dataclass
class IdentifiedIssueItem:
    """Represents a single civic grievance when multiple issues are reported in one statement."""

    issue_number: int
    category: str
    department_name: str
    department_id: str
    problem_summary: str
    priority: str = "normal"
    confidence_score: float = 0.80
    extracted_location: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class GrievanceUnderstandingResult:
    """
    Complete structured output for the JANASEVA AI Intelligent Grievance Understanding Engine.
    Strictly preserves all existing fields while adding Phase 5 intent, provenance,
    multi-issue, confidence-band, and emergency safety advisory capabilities.
    """

    original_transcript: str
    detected_language: str
    intent_type: str = "CIVIC_GRIEVANCE"
    is_valid_grievance: bool = True
    citizen_name: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    citizen_reference_id: Optional[str] = None
    designation: Optional[str] = None
    problem_summary: str = ""
    problem_description: str = ""
    location: ExtractedLocationData = field(default_factory=ExtractedLocationData)
    problem_duration: Optional[str] = None
    incident_date: Optional[str] = None
    affected_people: Optional[str] = None
    severity: Optional[str] = None
    department_category: Optional[str] = ""
    department_name: Optional[str] = ""
    department_id: Optional[str] = ""
    classification_explanation: str = ""
    priority: str = "normal"  # 'low' | 'normal' | 'high' | 'critical'
    priority_reason: str = ""
    safety_advisory: Optional[str] = None
    missing_information: List[str] = field(default_factory=list)
    missing_mandatory_fields: List[str] = field(default_factory=list)
    needs_clarification: bool = False
    clarification_question: Optional[str] = None
    enhanced_complaint: str = ""

    # Extended metadata for transparency, provenance, and multi-issue visibility
    confidence_score: float = 0.0
    confidence_band: str = "MEDIUM"  # 'HIGH' | 'MEDIUM' | 'LOW'
    secondary_categories: List[str] = field(default_factory=list)
    identified_issues: List[Dict[str, Any]] = field(default_factory=list)
    processing_source: str = "python_fallback"  # 'gemini' | 'hybrid' | 'python_fallback' | 'failed'
    ai_provider_used: str = "python_fallback"
    llm_api_configured: bool = False
    missing_env_vars: List[str] = field(default_factory=list)
    provenance_details: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["location"] = self.location.to_dict()
        return data


class BaseNLPPipeline(ABC):
    """Abstract interface for the JANASEVA AI NLP pipeline."""

    @abstractmethod
    def detect_language(self, text: str) -> str:
        raise NotImplementedError

    @abstractmethod
    def preprocess_and_translate(self, text: str, source_lang: str) -> Optional[str]:
        raise NotImplementedError

    @abstractmethod
    def classify_grievance(self, text: str, lang: str) -> tuple[str, float]:
        raise NotImplementedError

    @abstractmethod
    def assess_priority(self, text: str, category: str) -> str:
        raise NotImplementedError

    @abstractmethod
    def process(self, text: str) -> NLPAnalysisResult:
        raise NotImplementedError
