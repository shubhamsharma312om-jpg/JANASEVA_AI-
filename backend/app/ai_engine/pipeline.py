"""
JANASEVA AI — Intelligent Grievance Understanding Engine Pipeline Coordinator (Phase 5 Upgrade)
Architecture Principle:
- Gemini (gemini-3.8-flash) understands and reasons about citizen grievances (intent, entities,
  department classification, multiple issues, urgency, multilingual clarification, formal enhancement).
- Python validates and controls the application (schema validation, mandatory fields,
  department_mapping.json verification, anti-hallucination guardrails, confidence thresholds,
  conversation memory, provenance tracking, and SQLite persistence).
"""

import logging
from typing import Any, Dict, List, Optional

from app.ai_engine.base import (
    BaseNLPPipeline,
    ExtractedLocationData,
    GrievanceUnderstandingResult,
    NLPAnalysisResult,
)
from app.ai_engine.complaint_enhancer import complaint_enhancer
from app.ai_engine.department_classifier import department_classifier
from app.ai_engine.information_extractor import (
    information_extractor,
    is_generic_location_phrase,
)
from app.ai_engine.language_detector import language_detector
from app.ai_engine.validator import grievance_validator
from app.core.config import settings

logger = logging.getLogger("janaseva.ai_pipeline")


class Phase1NotImplementedError(NotImplementedError):
    """Preserved for backward compatibility with Phase 1 references."""


class IntelligentGrievancePipeline(BaseNLPPipeline):
    """
    Production Gemini-First + Python-Validated Grievance Understanding Pipeline for JANASEVA AI.
    """

    def __init__(self) -> None:
        self.category_to_department: Dict[str, str] = (
            settings.get_category_to_department_map()
        )
        self.supported_languages = settings.SUPPORTED_LANGUAGES

    def resolve_department(self, predicted_category: str) -> str:
        return self.category_to_department.get(
            predicted_category, "Relevant Civic Authority"
        )

    def detect_language(self, text: str) -> str:
        return language_detector.detect(text)

    def preprocess_and_translate(self, text: str, source_lang: str) -> Optional[str]:
        return complaint_enhancer.clean_core_text(text)

    def classify_grievance(self, text: str, lang: str) -> tuple[str, float]:
        res = department_classifier.classify(text, lang)
        return res["department_category"] or "Public Safety", float(
            res["confidence_score"]
        )

    def assess_priority(self, text: str, category: str) -> str:
        prio, _ = department_classifier.assess_priority(
            text=text,
            department_category=category,
            problem_duration=None,
            affected_people=None,
        )
        return prio.upper()

    def process(self, text: str) -> NLPAnalysisResult:
        """Execute pipeline and return legacy NLPAnalysisResult."""
        full = self.analyze_grievance(transcript=text)
        prio_map = {
            "low": "LOW",
            "normal": "MEDIUM",
            "high": "HIGH",
            "critical": "CRITICAL",
        }
        return NLPAnalysisResult(
            original_message=full["original_transcript"],
            detected_language=language_detector.to_core_language_code(
                full["detected_language"]
            ),
            translated_message=None,
            predicted_category=full["department_category"] or "Public Safety",
            assigned_department=full["department_name"] or "Relevant Civic Authority",
            priority=prio_map.get(full["priority"], "MEDIUM"),
            confidence_score=full.get("confidence_score", 0.85),
        )

    def analyze_grievance(
        self,
        transcript: str,
        preferred_language: Optional[str] = None,
        llm_candidate: Optional[Dict[str, Any]] = None,
        llm_provenance: Optional[Dict[str, Any]] = None,
        conversation_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Execute the complete Intelligent Grievance Understanding & Validation Pipeline:
        UNDERSTAND -> EXTRACT -> CLASSIFY -> CLARIFY -> ENHANCE -> VALIDATE.
        Supports single-turn analysis and multi-turn clarification memory (conversation_context).
        """
        clean_transcript = (transcript or "").strip()
        if not clean_transcript:
            raise ValueError("Complaint transcript cannot be empty.")

        # Handle multi-turn clarification memory (Section 5 & Test 15)
        prev_transcript = ""
        prev_location: Dict[str, Any] = {}
        prev_category: Optional[str] = None
        prev_citizen_name: Optional[str] = None
        prev_duration: Optional[str] = None
        if isinstance(conversation_context, dict):
            prev_transcript = str(
                conversation_context.get("original_transcript")
                or conversation_context.get("previous_complaint_text")
                or ""
            ).strip()
            if isinstance(conversation_context.get("extracted_location"), dict):
                prev_location = conversation_context["extracted_location"]
            elif isinstance(conversation_context.get("location"), dict):
                prev_location = conversation_context["location"]
            elif isinstance(conversation_context.get("previous_location"), dict):
                prev_location = conversation_context["previous_location"]
            prev_category = (
                conversation_context.get("department_category")
                or conversation_context.get("predicted_category")
                or conversation_context.get("previous_category")
            )
            prev_citizen_name = conversation_context.get("citizen_name")
            prev_duration = conversation_context.get("problem_duration")

        # Combined text when merging a clarification answer with an original grievance
        effective_transcript = (
            f"{prev_transcript} {clean_transcript}".strip()
            if prev_transcript and prev_transcript.lower() not in clean_transcript.lower()
            else clean_transcript
        )

        # Stage 1: Language Identification (Python baseline)
        py_detected_lang = language_detector.detect(effective_transcript)
        detected_lang = py_detected_lang

        # Stage 2: Python Deterministic Entity Extraction (baseline & fallback)
        citizen_name = (
            information_extractor.extract_citizen_name(effective_transcript)
            or prev_citizen_name
        )
        contact_number = information_extractor.extract_contact_number(
            effective_transcript
        )
        email = information_extractor.extract_email(effective_transcript)
        designation = information_extractor.extract_designation(effective_transcript)
        location_obj = information_extractor.extract_location(effective_transcript)

        # Merge any previously confirmed location fields from conversation_context
        for loc_key in (
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
        ):
            if getattr(location_obj, loc_key) is None and prev_location.get(loc_key):
                val = str(prev_location[loc_key]).strip()
                if not is_generic_location_phrase(val):
                    setattr(location_obj, loc_key, val)

        problem_duration, incident_date = (
            information_extractor.extract_duration_and_date(effective_transcript)
        )
        if not problem_duration and prev_duration:
            problem_duration = prev_duration

        affected_people = information_extractor.extract_affected_people(
            effective_transcript
        )

        # Stage 3: Python Classification & Intent Detection (baseline & fallback)
        classification = department_classifier.classify(
            text=effective_transcript,
            detected_language=detected_lang,
            extracted_location=location_obj,
            citizen_name=citizen_name,
            problem_duration=problem_duration,
        )
        intent_type = classification["intent_type"]
        is_valid_grievance = classification["is_valid_grievance"]
        dept_category = classification["department_category"]
        dept_name = classification["department_name"]
        dept_id = classification["department_id"]
        classification_explanation = classification["classification_explanation"]
        confidence_score = classification["confidence_score"]
        confidence_band = classification["confidence_band"]
        secondary_categories = classification["secondary_categories"]
        identified_issues = classification["identified_issues"]
        needs_clarification = classification["needs_clarification"]
        clarification_question = classification["clarification_question"]

        # If conversation_context had a previously identified category and the new message was just a location answer
        if not is_valid_grievance and prev_category:
            norm_prev = department_classifier.normalize_category_name(prev_category)
            if norm_prev:
                rec = department_classifier.by_category[norm_prev]
                intent_type = "CIVIC_GRIEVANCE"
                is_valid_grievance = True
                dept_category = rec["category"]
                dept_name = rec["department_name"]
                dept_id = rec["department_id"]
                confidence_score = 0.88
                confidence_band = "HIGH"
                needs_clarification = not (
                    location_obj.has_settlement() or location_obj.has_locality_or_street()
                ) or not bool(location_obj.landmark)
                clarification_question = (
                    department_classifier.build_contextual_clarification(
                        detected_language=detected_lang,
                        intent_type=intent_type,
                        department_category=dept_category,
                        candidate_categories=[],
                        location=location_obj,
                        problem_duration=problem_duration,
                        citizen_name=citizen_name,
                    )
                )

        # Stage 4: Urgency Assessment & Safety Advisory (Python baseline)
        priority, priority_reason = department_classifier.assess_priority(
            text=effective_transcript,
            department_category=dept_category,
            problem_duration=problem_duration,
            affected_people=affected_people,
            needs_clarification=needs_clarification,
            intent_type=intent_type,
        )

        # Stage 5: Primary Merge of Gemini (`gemini-3.8-flash`) Semantic Analysis
        # Principle: Gemini is the primary authority for semantic understanding; Python validates.
        gemini_ready = settings.is_gemini_configured()
        missing_env: List[str] = []
        if not gemini_ready:
            missing_env.append("GEMINI_API_KEY")
        if not settings.is_sarvam_configured():
            missing_env.append("SARVAM_API_KEY")

        prov_meta = dict(llm_provenance or {})
        processing_source = "python_fallback"
        ai_provider_used = "python_fallback"

        if llm_candidate and isinstance(llm_candidate, dict):
            processing_source = "hybrid"
            ai_provider_used = f"gemini ({settings.GEMINI_MODEL}) + python_validator"

            # 5.1 Language from Gemini (preserve script-specific 'te'/'hi'/'hi-en'/'te-en' if Python detected script)
            llm_lang = str(llm_candidate.get("detected_language") or "").strip().lower()
            if llm_lang in ("en", "te", "hi", "hi-en", "te-en") and py_detected_lang == "en":
                detected_lang = llm_lang

            # 5.2 Intent from Gemini (validated against SUPPORTED_INTENT_TYPES, with Python safety override for live danger)
            llm_intent = str(llm_candidate.get("intent_type") or "").strip().upper()
            if (
                llm_intent in settings.SUPPORTED_INTENT_TYPES
                and intent_type != "EMERGENCY_OR_IMMEDIATE_DANGER"
            ):
                # Do not allow Gemini to misclassify a clear civic grievance (score >= 3.0) as unrelated
                if llm_intent in ("GREETING", "UNRELATED_QUERY", "GENERAL_QUESTION") and is_valid_grievance and confidence_score >= 0.80:
                    pass
                else:
                    intent_type = llm_intent
                    is_valid_grievance = intent_type in (
                        "CIVIC_GRIEVANCE",
                        "EMERGENCY_OR_IMMEDIATE_DANGER",
                    )

            # 5.3 Citizen Details from Gemini (Primary; Python validator will strip if hallucinated)
            for c_field, py_val in (
                ("citizen_name", citizen_name),
                ("contact_number", contact_number),
                ("email", email),
                ("designation", designation),
            ):
                llm_val = llm_candidate.get(c_field)
                if isinstance(llm_val, str) and llm_val.strip() and llm_val.strip().lower() not in ("null", "none", "not provided", "unknown"):
                    if c_field == "citizen_name":
                        citizen_name = llm_val.strip()
                    elif c_field == "contact_number":
                        contact_number = llm_val.strip()
                    elif c_field == "email":
                        email = llm_val.strip()
                    elif c_field == "designation":
                        designation = llm_val.strip()

            # 5.4 Location from Gemini (Primary for all 11 fields; filtered against generic phrases)
            llm_loc = llm_candidate.get("location")
            if isinstance(llm_loc, dict):
                for loc_field in (
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
                ):
                    llm_loc_val = llm_loc.get(loc_field)
                    if (
                        isinstance(llm_loc_val, str)
                        and llm_loc_val.strip()
                        and llm_loc_val.strip().lower() not in ("null", "none", "not provided", "unknown")
                        and not is_generic_location_phrase(llm_loc_val)
                    ):
                        # Accept Gemini's extracted location if grounded in transcript or if Python had None
                        if getattr(location_obj, loc_field) is None or llm_loc_val.strip().lower() in effective_transcript.lower():
                            setattr(location_obj, loc_field, llm_loc_val.strip())

            # 5.5 Grievance Metadata from Gemini (Primary)
            if isinstance(llm_candidate.get("problem_duration"), str) and llm_candidate["problem_duration"].strip():
                problem_duration = llm_candidate["problem_duration"].strip()
            if isinstance(llm_candidate.get("incident_date"), str) and llm_candidate["incident_date"].strip():
                incident_date = llm_candidate["incident_date"].strip()
            if isinstance(llm_candidate.get("affected_people"), str) and llm_candidate["affected_people"].strip():
                affected_people = llm_candidate["affected_people"].strip()

            # 5.6 Department Classification from Gemini (Primary when valid grievance)
            if is_valid_grievance:
                llm_cat_raw = llm_candidate.get("department_category")
                norm_cat = department_classifier.normalize_category_name(llm_cat_raw)
                if norm_cat:
                    # Respect Gemini's semantic classification unless multi-issue tiebreaker applies
                    if not (
                        secondary_categories
                        and dept_category == "Water Supply"
                        and norm_cat == "Roads and Potholes"
                    ):
                        rec = department_classifier.by_category[norm_cat]
                        dept_category = rec["category"]
                        dept_name = rec["department_name"]
                        dept_id = rec["department_id"]

                if isinstance(llm_candidate.get("classification_explanation"), str) and llm_candidate["classification_explanation"].strip():
                    classification_explanation = llm_candidate["classification_explanation"].strip()

                if isinstance(llm_candidate.get("confidence_score"), (int, float)):
                    llm_conf = float(llm_candidate["confidence_score"])
                    if 0.0 < llm_conf <= 1.0:
                        confidence_score = round(max(confidence_score, llm_conf), 2)
                        confidence_band = department_classifier.get_confidence_band(
                            confidence_score
                        )

                # Merge secondary categories from Gemini
                if isinstance(llm_candidate.get("secondary_categories"), list):
                    for sc_item in llm_candidate["secondary_categories"]:
                        norm_sc = department_classifier.normalize_category_name(sc_item)
                        if norm_sc and norm_sc != dept_category and norm_sc not in secondary_categories:
                            secondary_categories.append(norm_sc)

                # Rebuild identified_issues if secondary_categories changed
                if secondary_categories:
                    identified_issues = department_classifier.build_identified_issues(
                        text=effective_transcript,
                        primary_category=dept_category or "Water Supply",
                        secondary_categories=secondary_categories,
                        scores={dept_category or "Water Supply": 4.5},
                        location=location_obj,
                    )
            else:
                dept_category = None
                dept_name = None
                dept_id = None
                secondary_categories = []
                identified_issues = []

            # 5.7 Priority & Reason from Gemini (Primary, except never downgrade CRITICAL safety hazards)
            llm_prio = str(llm_candidate.get("priority") or "").strip().lower()
            if (
                llm_prio in ("low", "normal", "high", "critical")
                and priority != "critical"
                and is_valid_grievance
            ):
                # Do not allow false urgency on 2-day streetlight maintenance
                if not (dept_category == "Streetlights" and priority == "normal" and llm_prio in ("high", "critical")):
                    priority = llm_prio
                    if isinstance(llm_candidate.get("priority_reason"), str) and llm_candidate["priority_reason"].strip():
                        priority_reason = llm_candidate["priority_reason"].strip()

            # 5.8 Clarification Question from Gemini
            if isinstance(llm_candidate.get("clarification_question"), str) and llm_candidate["clarification_question"].strip():
                clarification_question = llm_candidate["clarification_question"].strip()
        else:
            # Refresh contextual clarification question in case location_obj was enriched by conversation_context
            if needs_clarification or not is_valid_grievance or not location_obj.landmark or bool(prev_transcript):
                clarification_question = (
                    department_classifier.build_contextual_clarification(
                        detected_language=detected_lang,
                        intent_type=intent_type,
                        department_category=dept_category,
                        candidate_categories=(
                            [dept_category] + secondary_categories
                            if dept_category and secondary_categories
                            else []
                        ),
                        location=location_obj,
                        problem_duration=problem_duration,
                    )
                )

        # Compute safety advisory for critical / immediate danger
        safety_advisory = department_classifier.build_safety_advisory(
            text=effective_transcript,
            intent_type=intent_type,
            priority=priority,
            department_category=dept_category,
            detected_language=detected_lang,
        )
        if (
            llm_candidate
            and isinstance(llm_candidate.get("safety_advisory"), str)
            and llm_candidate["safety_advisory"].strip()
            and (intent_type == "EMERGENCY_OR_IMMEDIATE_DANGER" or priority == "critical")
        ):
            safety_advisory = llm_candidate["safety_advisory"].strip()

        # Stage 6: Professional Complaint Generation & Summary
        problem_summary, problem_description = (
            complaint_enhancer.generate_summary_and_description(
                original_transcript=effective_transcript,
                detected_language=detected_lang,
                department_category=dept_category,
                location=location_obj,
                problem_duration=problem_duration,
                secondary_categories=secondary_categories,
                intent_type=intent_type,
                is_valid_grievance=is_valid_grievance,
            )
        )

        enhanced_complaint = complaint_enhancer.generate_enhanced_complaint(
            original_transcript=effective_transcript,
            detected_language=detected_lang,
            department_category=dept_category,
            department_name=dept_name,
            citizen_name=citizen_name,
            designation=designation,
            contact_number=contact_number,
            email=email,
            location=location_obj,
            problem_duration=problem_duration,
            incident_date=incident_date,
            affected_people=affected_people,
            secondary_categories=secondary_categories,
            target_language_override=preferred_language,
            is_valid_grievance=is_valid_grievance,
        )

        # Use Gemini's enhanced_complaint & problem_summary when valid grievance
        if is_valid_grievance and llm_candidate and isinstance(llm_candidate, dict):
            if (
                isinstance(llm_candidate.get("enhanced_complaint"), str)
                and len(llm_candidate["enhanced_complaint"].strip()) >= 25
            ):
                cand_enh = llm_candidate["enhanced_complaint"].strip()
                # Ensure department_name is preserved for official formal routing clarity
                if dept_name and dept_name not in cand_enh:
                    cand_enh = f"To the {dept_name},\n\n{cand_enh}"
                enhanced_complaint = cand_enh

            if (
                isinstance(llm_candidate.get("problem_summary"), str)
                and len(llm_candidate["problem_summary"].strip()) >= 10
            ):
                problem_summary = llm_candidate["problem_summary"].strip()

        missing_info = information_extractor.compute_missing_information(
            location=location_obj,
            problem_duration=problem_duration,
            department_category=dept_category,
            needs_clarification=needs_clarification,
            citizen_name=citizen_name,
        )
        missing_mandatory = information_extractor.compute_missing_mandatory_fields(
            citizen_name=citizen_name,
            location=location_obj,
            department_category=dept_category,
            needs_clarification=needs_clarification,
            is_valid_grievance=is_valid_grievance,
        )

        provenance_details = {
            "source": processing_source,
            "model": settings.GEMINI_MODEL if llm_candidate else "python_rule_engine",
            "gemini_attempted": bool(prov_meta.get("gemini_attempted", False)),
            "gemini_succeeded": bool(llm_candidate is not None),
            "gemini_latency_ms": prov_meta.get("latency_ms"),
            "fallback_used": bool(llm_candidate is None),
            "error_code": prov_meta.get("error_code"),
            "error_message": prov_meta.get("error_message"),
        }

        result_obj = GrievanceUnderstandingResult(
            original_transcript=clean_transcript if not prev_transcript else effective_transcript,
            detected_language=detected_lang,
            intent_type=intent_type,
            is_valid_grievance=is_valid_grievance,
            citizen_name=citizen_name,
            contact_number=contact_number,
            email=email,
            designation=designation,
            problem_summary=problem_summary,
            problem_description=problem_description,
            location=location_obj,
            problem_duration=problem_duration,
            incident_date=incident_date,
            affected_people=affected_people,
            department_category=dept_category,
            department_name=dept_name,
            department_id=dept_id,
            classification_explanation=classification_explanation,
            priority=priority,
            priority_reason=priority_reason,
            safety_advisory=safety_advisory,
            missing_information=missing_info,
            missing_mandatory_fields=missing_mandatory,
            needs_clarification=needs_clarification,
            clarification_question=clarification_question,
            enhanced_complaint=enhanced_complaint,
            confidence_score=confidence_score,
            confidence_band=confidence_band,
            secondary_categories=secondary_categories,
            identified_issues=identified_issues,
            processing_source=processing_source,
            ai_provider_used=ai_provider_used,
            llm_api_configured=gemini_ready,
            missing_env_vars=missing_env,
            provenance_details=provenance_details,
        )

        # Stage 7: Strict Pydantic & Anti-Hallucination Validation
        return grievance_validator.validate_and_sanitize(
            raw_data=result_obj.to_dict(),
            original_transcript=result_obj.original_transcript,
        )


# Preserve Phase1ModularNLPPipeline alias for existing references
Phase1ModularNLPPipeline = IntelligentGrievancePipeline
grievance_ai_pipeline = IntelligentGrievancePipeline()
