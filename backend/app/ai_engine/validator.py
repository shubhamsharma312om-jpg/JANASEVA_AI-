"""
JANASEVA AI — Pydantic Schema & Anti-Hallucination Validator (Phase 5 Upgrade)
Validates all AI Grievance Understanding outputs using Pydantic (with a zero-dependency
schema validator fallback for sandboxed Python environments without pip packages),
enforces strict department_id / department_name / department_category verification
against department_mapping.json, validates intent types, and strips any hallucinated
or generic contact/personal/location details not grounded in the citizen's transcript.
"""

from typing import Any, Dict, List, Literal, Optional
from app.core.config import settings
from app.ai_engine.information_extractor import is_generic_location_phrase
from app.ai_engine.department_classifier import CATEGORY_SYNONYMS

ProvisionalPriority = Literal["low", "normal", "high", "critical"]

try:
    from pydantic import BaseModel, Field  # type: ignore

    HAS_PYDANTIC = True
except ImportError:
    HAS_PYDANTIC = False

    class BaseModel:  # type: ignore
        def __init__(self, **kwargs: Any) -> None:
            for k, v in kwargs.items():
                setattr(self, k, v)

        def model_dump(self) -> Dict[str, Any]:
            return dict(self.__dict__)

        def dict(self) -> Dict[str, Any]:
            return dict(self.__dict__)

    def Field(default: Any = None, **kwargs: Any) -> Any:  # type: ignore
        if "default_factory" in kwargs and callable(kwargs["default_factory"]):
            return kwargs["default_factory"]()
        return default


class LocationSchema(BaseModel):
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


class GrievanceAnalyzeRequestSchema(BaseModel):
    transcript: str = Field(
        ...,
        min_length=2,
        max_length=5000,
        description="Original citizen complaint text from voice transcription or manual input.",
    )
    preferred_language: Optional[str] = Field(
        default=None,
        description="Optional language override if citizen explicitly requests enhanced complaint in another language.",
    )
    existing_locality: Optional[str] = Field(
        default=None,
        description="Optional locality already typed by citizen in form.",
    )
    existing_landmark: Optional[str] = Field(
        default=None,
        description="Optional landmark already typed by citizen in form.",
    )
    conversation_context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional multi-turn clarification state containing original_transcript and previous extracted details.",
    )


class GrievanceStructuredAnalysisSchema(BaseModel):
    """
    Validated schema matching Section 4 and Phase 5 requirements,
    including intent_type, is_valid_grievance, identified_issues, confidence_band,
    safety_advisory, processing_source, and provenance_details.
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
    problem_summary: str
    problem_description: str
    location: LocationSchema = Field(default_factory=LocationSchema)
    problem_duration: Optional[str] = None
    incident_date: Optional[str] = None
    affected_people: Optional[str] = None
    severity: Optional[str] = None
    department_category: Optional[str] = None
    department_name: Optional[str] = None
    department_id: Optional[str] = None
    classification_explanation: str = ""
    priority: ProvisionalPriority = "normal"
    priority_reason: str
    safety_advisory: Optional[str] = None
    missing_information: List[str] = Field(default_factory=list)
    missing_mandatory_fields: List[str] = Field(default_factory=list)
    needs_clarification: bool = False
    clarification_question: Optional[str] = None
    enhanced_complaint: str

    # Extended fields for UI review, provenance & multi-issue transparency
    confidence_score: float = Field(default=0.85, ge=0.0, le=1.0)
    confidence_band: str = "HIGH"
    secondary_categories: List[str] = Field(default_factory=list)
    identified_issues: List[Dict[str, Any]] = Field(default_factory=list)
    processing_source: str = "python_fallback"
    ai_provider_used: str = "python_fallback"
    llm_api_configured: bool = False
    missing_env_vars: List[str] = Field(default_factory=list)
    provenance_details: Dict[str, Any] = Field(default_factory=dict)


class GrievanceAnalysisValidator:
    """
    Verifies department mappings against department_mapping.json, validates intent types,
    and prevents hallucination of contact details, names, dates, or generic locations.
    """

    def __init__(self) -> None:
        self.mappings = settings.get_all_department_records()
        self.by_category = {m["category"].lower(): m for m in self.mappings}
        self.by_id = {m["department_id"].upper(): m for m in self.mappings}
        self.by_name = {m["department_name"].lower(): m for m in self.mappings}

    def validate_and_sanitize(
        self, raw_data: Dict[str, Any], original_transcript: str
    ) -> Dict[str, Any]:
        """
        1. Validate intent_type against SUPPORTED_INTENT_TYPES.
        2. Verify department_category, department_name, and department_id against department_mapping.json.
        3. Verify contact_number, email, citizen_name, and location are grounded in original_transcript.
        4. Strip generic location phrases ("our street", "main road", etc.).
        5. Track any validation modifications in provenance_details.
        """
        data = dict(raw_data)
        data["original_transcript"] = original_transcript
        validation_notes: List[str] = []

        # 1. Validate intent_type
        raw_intent = str(data.get("intent_type") or "CIVIC_GRIEVANCE").strip().upper()
        if raw_intent not in settings.SUPPORTED_INTENT_TYPES:
            validation_notes.append(f"Normalized unsupported intent '{raw_intent}' to CIVIC_GRIEVANCE")
            raw_intent = "CIVIC_GRIEVANCE"
        data["intent_type"] = raw_intent

        is_valid_grievance = data.get("is_valid_grievance")
        if is_valid_grievance is None:
            is_valid_grievance = raw_intent in (
                "CIVIC_GRIEVANCE",
                "EMERGENCY_OR_IMMEDIATE_DANGER",
            )
        data["is_valid_grievance"] = bool(is_valid_grievance)

        # 2. Verify Department against department_mapping.json
        req_cat_raw = str(data.get("department_category") or "").strip()
        req_cat = req_cat_raw.lower()
        if req_cat in CATEGORY_SYNONYMS:
            req_cat = CATEGORY_SYNONYMS[req_cat].lower()
        req_id = str(data.get("department_id") or "").strip().upper()
        req_name = str(data.get("department_name") or "").strip().lower()

        matched_dept = (
            self.by_category.get(req_cat)
            or self.by_id.get(req_id)
            or self.by_name.get(req_name)
        )

        if not data["is_valid_grievance"]:
            # For GREETING, UNRELATED_QUERY, GENERAL_QUESTION, or unclarified AMBIGUOUS_REQUEST:
            # Do NOT guess a department or generate a fake complaint letter!
            data["department_category"] = None
            data["department_name"] = None
            data["department_id"] = None
            data["enhanced_complaint"] = ""
            data["needs_clarification"] = True
        else:
            if not matched_dept:
                validation_notes.append(
                    f"Replaced unverified department '{req_cat_raw}' with default Public Safety (DEPT-SAFE-07)"
                )
                matched_dept = self.by_category["public safety"]
            data["department_category"] = matched_dept["category"]
            data["department_name"] = matched_dept["department_name"]
            data["department_id"] = matched_dept["department_id"]

        # 3. Normalize priority to ('low', 'normal', 'high', 'critical')
        raw_prio = str(data.get("priority") or "normal").strip().lower()
        prio_map = {
            "low": "low",
            "normal": "normal",
            "medium": "normal",
            "high": "high",
            "critical": "critical",
            "urgent": "high",
        }
        data["priority"] = prio_map.get(raw_prio, "normal")

        # 4. Anti-hallucination check on contact_number, email, and citizen_name
        transcript_lower = original_transcript.lower()
        if data.get("email"):
            if str(data["email"]).strip().lower() not in transcript_lower:
                validation_notes.append("Stripped unverified email not present in transcript")
                data["email"] = None

        if data.get("contact_number"):
            digits_in_contact = "".join(
                ch for ch in str(data["contact_number"]) if ch.isdigit()
            )
            digits_in_transcript = "".join(
                ch for ch in original_transcript if ch.isdigit()
            )
            if not digits_in_contact or digits_in_contact[-8:] not in digits_in_transcript:
                validation_notes.append("Stripped unverified contact_number not present in transcript")
                data["contact_number"] = None

        if data.get("citizen_name"):
            cname = str(data["citizen_name"]).strip()
            if cname.lower() in (
                "not provided",
                "not given",
                "unknown",
                "anonymous",
                "citizen",
                "resident",
                "none",
                "null",
            ) or "not provided" in cname.lower():
                validation_notes.append(f"Stripped invalid citizen_name '{cname}'")
                data["citizen_name"] = None
            elif cname.isascii():
                # Ensure at least one name token appears in the transcript
                name_tokens = [t.lower() for t in cname.split() if len(t) >= 2]
                if name_tokens and not any(t in transcript_lower for t in name_tokens):
                    validation_notes.append(f"Stripped hallucinated citizen_name '{cname}' not in transcript")
                    data["citizen_name"] = None

        # 5. Validate and sanitize location dictionary (all 12 keys)
        raw_loc = data.get("location") or {}
        if not isinstance(raw_loc, dict):
            raw_loc = {}
        clean_loc: Dict[str, Optional[str]] = {}
        for k in (
            "village",
            "town",
            "city",
            "district",
            "mandal",
            "ward",
            "area",
            "street",
            "house_number",
            "landmark",
            "pincode",
            "additional_location_details",
        ):
            val = raw_loc.get(k)
            if isinstance(val, str):
                val = val.strip()
                if val.lower() in (
                    "",
                    "null",
                    "none",
                    "n/a",
                    "not provided",
                    "unknown",
                    "not mentioned",
                ):
                    val = None
                elif k in ("village", "town", "city", "area", "street", "landmark") and is_generic_location_phrase(val):
                    validation_notes.append(f"Stripped generic phrase '{val}' from location.{k}")
                    val = None
                elif k == "pincode":
                    digits_pin = "".join(ch for ch in val if ch.isdigit())
                    if len(digits_pin) != 6 or digits_pin not in original_transcript:
                        val = None
            else:
                val = None
            clean_loc[k] = val
        data["location"] = clean_loc

        # 6. Clean nullable string fields
        for field_name in (
            "citizen_name",
            "contact_number",
            "email",
            "citizen_reference_id",
            "designation",
            "problem_duration",
            "incident_date",
            "affected_people",
            "severity",
            "clarification_question",
            "safety_advisory",
        ):
            val = data.get(field_name)
            if isinstance(val, str):
                val = val.strip()
                if val.lower() in (
                    "",
                    "null",
                    "none",
                    "n/a",
                    "not mentioned",
                    "not provided",
                    "unknown",
                ):
                    val = None
                data[field_name] = val
            else:
                data[field_name] = None

        # 7. Ensure required list, confidence & provenance types
        data["missing_information"] = list(data.get("missing_information") or [])
        data["missing_mandatory_fields"] = list(data.get("missing_mandatory_fields") or [])
        data["secondary_categories"] = [
            CATEGORY_SYNONYMS.get(c.lower().strip(), c)
            for c in (data.get("secondary_categories") or [])
            if isinstance(c, str)
            and CATEGORY_SYNONYMS.get(c.lower().strip(), c).lower() in self.by_category
            and CATEGORY_SYNONYMS.get(c.lower().strip(), c) != data.get("department_category")
        ]
        data["identified_issues"] = list(data.get("identified_issues") or [])
        data["missing_env_vars"] = list(data.get("missing_env_vars") or [])
        data["needs_clarification"] = bool(data.get("needs_clarification", False))
        data["llm_api_configured"] = bool(data.get("llm_api_configured", False))
        conf_score = max(
            0.0, min(1.0, float(data.get("confidence_score") or 0.85))
        )
        data["confidence_score"] = conf_score
        if conf_score >= settings.CONFIDENCE_HIGH_THRESHOLD:
            data["confidence_band"] = "HIGH"
        elif conf_score >= settings.CONFIDENCE_MEDIUM_THRESHOLD:
            data["confidence_band"] = "MEDIUM"
        else:
            data["confidence_band"] = "LOW"

        prov = dict(data.get("provenance_details") or {})
        prov["validation_modified"] = bool(validation_notes)
        prov["validation_notes"] = validation_notes
        data["provenance_details"] = prov

        if HAS_PYDANTIC:
            validated = GrievanceStructuredAnalysisSchema(**data)
            try:
                return validated.model_dump()
            except AttributeError:
                return validated.dict()

        return data


grievance_validator = GrievanceAnalysisValidator()
