"""
JANASEVA AI — Multilingual Professional Complaint Generator (Phase 5 Upgrade)
Generates a clear, respectful, formally structured complaint in the SAME language
as the citizen's original input while strictly preserving every extracted detail
(citizen name, designation, location, landmark, duration, incident date, affected people,
and secondary issues) without inventing any facts or exaggerating severity.
Never generates a complaint letter for greetings, unrelated queries, or unclarified ambiguous statements.
"""

import re
from typing import List, Optional
from app.ai_engine.base import ExtractedLocationData

TELUGU_CATEGORY_LABELS = {
    "Water Supply": "మంచినీటి సరఫరా (Water Supply Department)",
    "Roads and Potholes": "రోడ్లు మరియు గుంతల మరమ్మతు (Municipal Engineering)",
    "Garbage Collection": "చెత్త సేకరణ మరియు పారిశుద్ధ్యం (Sanitation Department)",
    "Electricity": "విద్యుత్ సరఫరా (Electricity Department)",
    "Streetlights": "వీధి దీపాల నిర్వహణ (Electrical Maintenance)",
    "Drainage": "డ్రైనేజీ మరియు మురుగునీటి నిర్వహణ (Drainage Department)",
    "Public Safety": "ప్రజా భద్రత (Relevant Civic Authority)",
}

HINDI_CATEGORY_LABELS = {
    "Water Supply": "जलापूर्ति विभाग (Water Supply Department)",
    "Roads and Potholes": "नगरपालिका अभियांत्रिकी एवं सड़क विभाग (Municipal Engineering)",
    "Garbage Collection": "स्वच्छता एवं कचरा प्रबंधन विभाग (Sanitation Department)",
    "Electricity": "विद्युत विभाग (Electricity Department)",
    "Streetlights": "स्ट्रीट लाइट रखरखाव विभाग (Electrical Maintenance)",
    "Drainage": "जल निकासी एवं सीवरेज विभाग (Drainage Department)",
    "Public Safety": "संबंधित नागरिक सुरक्षा प्राधिकरण (Relevant Civic Authority)",
}


class ComplaintEnhancer:
    """Builds problem_summary, problem_description, and enhanced_complaint in the citizen's language."""

    @staticmethod
    def clean_core_text(original_transcript: str) -> str:
        """Strip any appended UI location suffix while keeping the citizen's full message."""
        if not original_transcript:
            return ""
        core = original_transcript.split("| Location:")[0].strip()
        return re.sub(r"\s+", " ", core)

    @classmethod
    def generate_summary_and_description(
        cls,
        original_transcript: str,
        detected_language: str,
        department_category: Optional[str],
        location: ExtractedLocationData,
        problem_duration: Optional[str],
        secondary_categories: Optional[List[str]] = None,
        intent_type: str = "CIVIC_GRIEVANCE",
        is_valid_grievance: bool = True,
    ) -> tuple[str, str]:
        core_text = cls.clean_core_text(original_transcript)
        lang = (detected_language or "en").lower()

        if not is_valid_grievance or not department_category:
            if intent_type == "GREETING":
                return "Citizen greeting — awaiting civic grievance details", core_text
            if intent_type in ("UNRELATED_QUERY", "GENERAL_QUESTION"):
                return "Non-grievance query — outside civic grievance scope", core_text
            return "Clarification needed — specific civic issue not yet identified", core_text

        loc_parts = [
            p
            for p in (
                location.house_number,
                location.street,
                location.area,
                location.village,
                location.town,
                location.city,
                location.district,
            )
            if p
        ]
        loc_str = ", ".join(loc_parts)

        if lang == "te":
            cat_te = TELUGU_CATEGORY_LABELS.get(department_category, department_category)
            summary = f"{cat_te}కు సంబంధించిన ఫిర్యాదు"
            if loc_str:
                summary += f" ({loc_str})"
            if problem_duration:
                summary += f" — వ్యవధి: {problem_duration}"
            return summary, core_text

        if lang == "hi":
            cat_hi = HINDI_CATEGORY_LABELS.get(department_category, department_category)
            summary = f"{cat_hi} से संबंधित नागरिक शिकायत"
            if loc_str:
                summary += f" ({loc_str})"
            if problem_duration:
                summary += f" — अवधि: {problem_duration}"
            return summary, core_text

        # English, Hinglish ('hi-en'), Telugu-English ('te-en'), or other languages
        lower_core = core_text.lower()
        specific_phrase: Optional[str] = None
        phrase_candidates = [
            ("no drinking water supply", "No drinking water supply"),
            ("no drinking water", "No drinking water supply"),
            ("no water supply", "No water supply"),
            ("paani nahi aa raha", "No water supply"),
            ("water has not come", "Water supply disruption"),
            ("drainage overflow", "Drainage overflow problem"),
            ("sewage overflow", "Sewage overflow problem"),
            ("no electricity", "No electricity / power outage"),
            ("live electric wire", "Live electric wire fallen on road"),
            ("street light", "Streetlight not working"),
            ("streetlight", "Streetlight not working"),
            ("potholes", "Road potholes hazard"),
            ("garbage", "Uncollected garbage"),
        ]
        for needle, label in phrase_candidates:
            if needle in lower_core:
                specific_phrase = label
                break

        all_cats = [department_category] + (secondary_categories or [])
        cat_label = " & ".join(all_cats)
        if specific_phrase and not secondary_categories:
            summary = f"{specific_phrase} ({cat_label})"
        else:
            summary = f"{cat_label} grievance"
        if loc_str:
            summary += f" at {loc_str}"
        if location.landmark and location.landmark not in loc_str:
            summary += f" ({location.landmark})"
        if problem_duration:
            summary += f" [{problem_duration}]"
        return summary, core_text

    @classmethod
    def generate_enhanced_complaint(
        cls,
        original_transcript: str,
        detected_language: str,
        department_category: Optional[str],
        department_name: Optional[str],
        citizen_name: Optional[str],
        designation: Optional[str],
        contact_number: Optional[str],
        email: Optional[str],
        location: ExtractedLocationData,
        problem_duration: Optional[str],
        incident_date: Optional[str],
        affected_people: Optional[str],
        secondary_categories: Optional[List[str]] = None,
        target_language_override: Optional[str] = None,
        is_valid_grievance: bool = True,
    ) -> str:
        """
        Generate a formal, respectful enhanced complaint in the citizen's language
        containing only verified facts from the original complaint.
        Returns empty string if the message is not a valid civic grievance.
        """
        if not is_valid_grievance or not department_category or not department_name:
            return ""

        core_text = cls.clean_core_text(original_transcript)
        lang = (target_language_override or detected_language or "en").lower()

        loc_items = [
            p
            for p in (
                location.house_number,
                location.street,
                location.area,
                location.ward,
                location.village,
                location.town,
                location.mandal,
                location.district,
                location.city,
                location.pincode,
            )
            if p
        ]
        loc_line = ", ".join(loc_items)

        # 1. TELUGU FORMAL ENHANCED COMPLAINT
        if lang == "te":
            cat_te = TELUGU_CATEGORY_LABELS.get(department_category, department_category)
            lines = [
                f"గౌరవనీయులైన {department_name} అధికారులకు,",
                f"విషయం: {cat_te} సమస్య పరిష్కారం కొరకు వినతి.",
                "",
                f"వివరాలు: {core_text}",
            ]
            details: List[str] = []
            if loc_line:
                details.append(f"• ప్రాంతం / చిరునామా: {loc_line}")
            if location.landmark:
                details.append(f"• సమీప ల్యాండ్‌మార్క్: {location.landmark}")
            if problem_duration:
                details.append(f"• సమస్య ఉన్న వ్యవధి: {problem_duration}")
            if incident_date:
                details.append(f"• సంఘటన తేదీ / సమయం: {incident_date}")
            if affected_people:
                details.append(f"• ప్రభావితమైన వారు: {affected_people}")
            if citizen_name:
                sender = citizen_name + (f" ({designation})" if designation else "")
                details.append(f"• ఫిర్యాదుదారు పేరు: {sender}")
            if contact_number or email:
                c_str = " | ".join([x for x in (contact_number, email) if x])
                details.append(f"• సంప్రదించవలసిన వివరాలు: {c_str}")

            if details:
                lines.append("")
                lines.extend(details)

            lines.append("")
            lines.append(
                "దయచేసి ఈ సమస్యను పరిశీలించి తగిన చర్యలు తీసుకోగలరని కోరుతున్నాము."
            )
            return "\n".join(lines)

        # 2. HINDI FORMAL ENHANCED COMPLAINT
        if lang == "hi":
            cat_hi = HINDI_CATEGORY_LABELS.get(department_category, department_category)
            lines = [
                f"सेवा में, संबंधित अधिकारी, {department_name},",
                f"विषय: {cat_hi} के संबंध में नागरिक शिकायत के निवारण हेतु प्रार्थना पत्र।",
                "",
                f"विवरण: {core_text}",
            ]
            details = []
            if loc_line:
                details.append(f"• स्थान / क्षेत्र: {loc_line}")
            if location.landmark:
                details.append(f"• निकटतम पहचान चिह्न (Landmark): {location.landmark}")
            if problem_duration:
                details.append(f"• समस्या की अवधि: {problem_duration}")
            if incident_date:
                details.append(f"• घटना की तिथि / समय: {incident_date}")
            if affected_people:
                details.append(f"• प्रभावित नागरिक: {affected_people}")
            if citizen_name:
                sender = citizen_name + (f" ({designation})" if designation else "")
                details.append(f"• शिकायतकर्ता का नाम: {sender}")
            if contact_number or email:
                c_str = " | ".join([x for x in (contact_number, email) if x])
                details.append(f"• संपर्क विवरण: {c_str}")

            if details:
                lines.append("")
                lines.extend(details)

            lines.append("")
            lines.append(
                "अतः आपसे विनम्र अनुरोध है कि उक्त समस्या का शीघ्र निरीक्षण कर उचित कार्यवाही करने की कृपा करें।"
            )
            return "\n".join(lines)

        # 3. ENGLISH / CODE-MIXED ('hi-en', 'te-en') FORMAL ENHANCED COMPLAINT
        all_categories = [department_category] + (secondary_categories or [])
        subject_categories = " and ".join(all_categories)

        polished_body = core_text.strip()
        if polished_body and polished_body[0].islower():
            polished_body = polished_body[0].upper() + polished_body[1:]
        if polished_body and polished_body[-1] not in ".!?।":
            polished_body += "."

        lines = [
            f"To the {department_name},",
            f"Subject: Formal Grievance Regarding {subject_categories}"
            + (f" at {loc_line}" if loc_line else ""),
            "",
            f"Statement of Grievance: {polished_body}",
        ]

        details = []
        if loc_line:
            details.append(f"• Location: {loc_line}")
        if location.landmark:
            details.append(f"• Nearest Landmark: {location.landmark}")
        if problem_duration:
            details.append(f"• Reported Duration: {problem_duration}")
        if incident_date:
            details.append(f"• Incident Date / Time: {incident_date}")
        if affected_people:
            details.append(f"• Affected Citizens: {affected_people}")
        if secondary_categories:
            details.append(
                f"• Additional Civic Issues Mentioned: {', '.join(secondary_categories)}"
            )
        if citizen_name:
            sender = citizen_name + (f" ({designation})" if designation else "")
            details.append(f"• Reported By: {sender}")
        if contact_number or email:
            c_str = " | ".join([x for x in (contact_number, email) if x])
            details.append(f"• Contact Information: {c_str}")

        if details:
            lines.append("")
            lines.extend(details)

        lines.append("")
        lines.append(
            f"We respectfully request the {department_name} to inspect the site and take appropriate remedial action."
        )
        return "\n".join(lines)


complaint_enhancer = ComplaintEnhancer()
