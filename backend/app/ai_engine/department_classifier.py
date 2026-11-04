"""
JANASEVA AI — Hybrid Multilingual Department Classifier, Intent Detector & Priority Assessor (Phase 5 Upgrade)
Routes citizen complaints to the 7 official categories defined in department_mapping.json,
detects grievance intent (CIVIC_GRIEVANCE, GREETING, GENERAL_QUESTION, UNRELATED_QUERY,
AMBIGUOUS_REQUEST, EMERGENCY_OR_IMMEDIATE_DANGER), identifies multiple separate issues,
enforces configurable confidence thresholds, and generates context-aware multilingual clarifications.
"""

import re
from typing import Any, Dict, List, Optional, Tuple
from app.core.config import settings
from app.ai_engine.base import ExtractedLocationData

# Essential service tie-breaking priority order (higher weight wins ties in multi-issue complaints)
ESSENTIAL_SERVICE_TIEBREAKER: Dict[str, int] = {
    "Electricity": 7,
    "Water Supply": 6,
    "Drainage": 5,
    "Public Safety": 4,
    "Garbage Collection": 3,
    "Roads and Potholes": 2,
    "Streetlights": 1,
}

# Canonical synonym mapping for Gemini or external category labels -> exact 7 categories in department_mapping.json
CATEGORY_SYNONYMS: Dict[str, str] = {
    "water supply": "Water Supply",
    "water": "Water Supply",
    "water department": "Water Supply",
    "water supply department": "Water Supply",
    "drinking water": "Water Supply",
    "roads and potholes": "Roads and Potholes",
    "road damage": "Roads and Potholes",
    "roads & potholes": "Roads and Potholes",
    "roads": "Roads and Potholes",
    "potholes": "Roads and Potholes",
    "municipal engineering": "Roads and Potholes",
    "garbage collection": "Garbage Collection",
    "garbage / sanitation": "Garbage Collection",
    "garbage": "Garbage Collection",
    "sanitation": "Garbage Collection",
    "sanitation department": "Garbage Collection",
    "waste management": "Garbage Collection",
    "electricity": "Electricity",
    "electricity department": "Electricity",
    "power supply": "Electricity",
    "power": "Electricity",
    "streetlights": "Streetlights",
    "street lights": "Streetlights",
    "streetlight": "Streetlights",
    "street light": "Streetlights",
    "electrical maintenance": "Streetlights",
    "drainage": "Drainage",
    "drainage department": "Drainage",
    "sewage": "Drainage",
    "sewerage": "Drainage",
    "public safety": "Public Safety",
    "safety": "Public Safety",
    "relevant civic authority": "Public Safety",
}

# Multilingual weighted lexicon for the 7 official JANASEVA AI categories
CATEGORY_LEXICON: Dict[str, List[Tuple[str, float]]] = {
    "Water Supply": [
        # English
        ("drinking water", 3.5),
        ("water supply", 3.8),
        ("water has not been supplied", 4.0),
        ("no water supply", 4.2),
        ("no water", 3.2),
        ("water not coming", 3.8),
        ("water pipeline", 3.5),
        ("pipeline leakage", 3.0),
        ("pipe leakage", 3.0),
        ("water leak", 2.8),
        ("contaminated water", 3.5),
        ("dirty drinking water", 3.5),
        ("low water pressure", 3.0),
        ("water tap", 2.8),
        ("water tanker", 2.5),
        ("borewell", 2.2),
        # Telugu script
        ("మంచినీటి", 3.8),
        ("మంచినీరు", 3.8),
        ("నీటి సరఫరా లేదు", 4.2),
        ("నీటి సరఫరా", 3.8),
        ("నీళ్లు రావడం లేదు", 3.8),
        ("నీళ్ళు రావడం లేదు", 3.8),
        ("వాటర్ పైప్", 3.2),
        ("పైప్‌లైన్ లీకేజీ", 3.2),
        ("తాగునీరు", 3.5),
        ("కుళాయి", 2.8),
        # Hindi script
        ("पीने का पानी", 3.8),
        ("पानी की सप्लाई नहीं", 4.2),
        ("पानी की सप्लाई", 3.8),
        ("पानी नहीं आ रहा", 4.0),
        ("जल आपूर्ति", 3.8),
        ("जलापूर्ति", 3.8),
        ("पाइपलाइन लीक", 3.2),
        ("गंदा पानी आ रहा", 3.2),
        ("नल में पानी", 3.0),
        # Hinglish & Telugu-English code-mixed
        ("water supply nahi aa rahi", 4.2),
        ("paani nahi aa raha", 3.8),
        ("pani nahi aa raha", 3.8),
        ("drinking water ledu", 3.8),
        ("water ravatledu", 3.8),
        ("neellu ravatledu", 3.8),
        ("manchineeti", 3.5),
        ("water supply ledu", 3.8),
        ("paani ki problem", 3.2),
        ("pani ki samasya", 3.2),
        ("water pipe leak", 3.0),
    ],
    "Roads and Potholes": [
        # English
        ("full of potholes", 3.8),
        ("pothole", 3.5),
        ("potholes", 3.5),
        ("damaged road", 3.2),
        ("broken road", 3.2),
        ("bad road", 2.8),
        ("road problem", 3.2),
        ("road surface", 2.8),
        ("road repair", 3.0),
        ("footpath broken", 2.8),
        ("speed breaker", 2.5),
        ("asphalt", 2.5),
        ("craters on road", 3.2),
        # Telugu script
        ("గుంతలు", 3.5),
        ("రోడ్డుపై గుంతలు", 3.8),
        ("రోడ్డు పాడైంది", 3.5),
        ("రోడ్డు దెబ్బతింది", 3.5),
        ("రహదారి", 2.5),
        # Hindi script
        ("गड्ढे", 3.5),
        ("गड्ढा", 3.2),
        ("सड़क खराब", 3.5),
        ("टूटी सड़क", 3.5),
        ("सड़क पर गड्ढे", 3.8),
        ("फुटपाथ टूटा", 2.8),
        # Hinglish & Telugu-English code-mixed
        ("sadak par gaddhe", 3.8),
        ("road par gaddhe", 3.8),
        ("gaddhe", 3.2),
        ("road kharab", 3.2),
        ("sadak kharab", 3.2),
        ("tooti sadak", 3.2),
        ("road meedha gunthalu", 3.8),
        ("gunthalu", 3.2),
        ("road damage", 3.0),
    ],
    "Garbage Collection": [
        # English
        ("garbage", 3.5),
        ("trash", 3.0),
        ("rubbish", 3.0),
        ("waste collection", 3.5),
        ("uncollected waste", 3.5),
        ("dustbin", 3.2),
        ("community bin", 3.2),
        ("dumping waste", 3.0),
        ("garbage truck", 3.2),
        ("sanitation", 2.8),
        ("foul smell from waste", 3.2),
        ("street sweeping", 2.8),
        # Telugu script
        ("చెత్తను", 3.8),
        ("చెత్త", 3.5),
        ("చెత్త సేకరణ", 3.8),
        ("తీసుకెళ్లడం లేదు", 2.5),
        ("డస్ట్‌బిన్", 3.2),
        ("చెత్త కుండీ", 3.5),
        ("దుర్వాసన", 2.4),
        ("పారిశుద్ధ్యం", 3.0),
        # Hindi script
        ("कचरा", 3.5),
        ("कूड़ा", 3.5),
        ("कूड़ेदान", 3.5),
        ("कचरा गाड़ी", 3.5),
        ("गंदगी", 2.8),
        ("सफाई नहीं", 3.0),
        # Hinglish & Telugu-English code-mixed
        ("kachra", 3.5),
        ("kuda", 3.2),
        ("kooda", 3.2),
        ("dustbin overflow", 3.5),
        ("chetha", 3.5),
        ("garbage collect", 3.5),
        ("kachra gadi", 3.5),
        ("kachra nahi uthaya", 3.8),
    ],
    "Electricity": [
        # English
        ("without electricity", 3.8),
        ("electricity", 3.2),
        ("power cut", 3.5),
        ("power outage", 3.5),
        ("no power", 3.2),
        ("transformer", 3.8),
        ("voltage fluctuation", 3.5),
        ("low voltage", 3.2),
        ("high voltage", 3.2),
        ("live electric wire", 4.5),
        ("electric wire", 3.8),
        ("live wire", 4.2),
        ("power supply", 3.5),
        ("short circuit", 3.5),
        ("electric pole", 3.2),
        ("sparks from transformer", 4.0),
        ("feeder line", 3.2),
        # Telugu script
        ("కరెంట్ పోతోంది", 3.5),
        ("కరెంట్ లేదు", 3.5),
        ("విద్యుత్", 3.5),
        ("ట్రాన్స్‌ఫార్మర్", 3.8),
        ("స్పార్క్స్", 3.5),
        ("లో వోల్టేజ్", 3.2),
        ("కరెంట్ వైర్లు", 3.8),
        ("కరెంట్ తీగ", 4.0),
        # Hindi script
        ("बिजली", 3.5),
        ("बिजली कटौती", 3.8),
        ("पावर कट", 3.5),
        ("ट्रांसफार्मर", 3.8),
        ("वोल्टेज", 3.2),
        ("बिजली के तार", 3.8),
        ("खुला तार", 4.0),
        ("बिजली नहीं आ रही", 3.8),
        # Hinglish & Telugu-English code-mixed
        ("bijli nahi aa rahi", 3.8),
        ("bijli cut", 3.5),
        ("bijli", 3.2),
        ("current poindi", 3.5),
        ("current ledu", 3.5),
        ("current pothundi", 3.5),
        ("transformer blast", 4.0),
        ("transformer spark", 4.0),
        ("light gayi", 3.0),
        ("batti gul", 3.0),
    ],
    "Streetlights": [
        # English
        ("streetlight", 4.0),
        ("streetlights", 4.0),
        ("street light", 4.0),
        ("street lights", 4.0),
        ("street lamp", 3.8),
        ("street lamps", 3.8),
        ("lamp post", 3.5),
        ("dark street at night", 3.2),
        ("light pole not working", 3.8),
        # Telugu script
        ("వీధి దీపాలు", 4.0),
        ("వీధి లైట్లు", 4.0),
        ("స్ట్రీట్ లైట్", 4.0),
        ("స్ట్రీట్ లైట్లు", 4.0),
        ("రాత్రి పూట చీకటిగా", 3.2),
        # Hindi script
        ("स्ट्रीट लाइट", 4.0),
        ("स्ट्रीट लाइटें", 4.0),
        ("गली की लाइट", 3.8),
        ("सड़क की बत्ती", 3.8),
        ("खंभे की लाइट", 3.8),
        # Hinglish & Telugu-English code-mixed
        ("street light kaam nahi", 4.0),
        ("street light pani cheyatledu", 4.0),
        ("veedhi light", 3.8),
        ("gali ki light band", 3.8),
        ("pole light kharab", 3.8),
    ],
    "Drainage": [
        # English
        ("drainage problem", 4.0),
        ("drainage", 3.8),
        ("sewage", 3.8),
        ("sewer", 3.5),
        ("manhole", 4.0),
        ("open manhole", 4.2),
        ("stormwater drain", 3.8),
        ("blocked drain", 3.8),
        ("overflowing drain", 3.8),
        ("gutter overflow", 3.8),
        ("waterlogging", 3.2),
        ("drain water", 3.5),
        # Telugu script
        ("డ్రైనేజీ", 3.8),
        ("మ్యాన్‌హోల్", 4.0),
        ("మురుగు నీరు", 3.8),
        ("మురుగు కాలువ", 3.8),
        ("కాలువ పొంగి", 3.8),
        # Hindi script
        ("नाली", 3.8),
        ("नाला", 3.5),
        ("सीवर", 3.8),
        ("मैनहोल", 4.0),
        ("गंदा नाला", 3.8),
        ("नाली का पानी", 3.8),
        ("जलभराव", 3.2),
        # Hinglish & Telugu-English code-mixed
        ("naali overflow", 3.8),
        ("nali jam", 3.8),
        ("gutter ka paani", 3.8),
        ("drainage overflow", 3.8),
        ("mori", 3.0),
        ("kaluva block", 3.5),
    ],
    "Public Safety": [
        # English
        ("fallen tree", 3.8),
        ("tree branch", 3.5),
        ("unsafe building", 3.5),
        ("collapsed wall", 3.8),
        ("public safety", 3.5),
        ("stray dog", 3.2),
        ("stray dogs", 3.2),
        ("stray cattle", 3.0),
        ("illegal encroachment", 3.0),
        ("fire hazard", 3.8),
        ("dangerous structure", 3.5),
        ("open pit", 3.2),
        ("public hazard", 3.5),
        # Telugu script
        ("చెట్టు కూలిపోయింది", 3.8),
        ("చెట్టు కొమ్మ", 3.5),
        ("వీధి కుక్కలు", 3.5),
        ("ప్రమాదకరంగా", 3.0),
        ("కూలిపోయే గోడ", 3.5),
        # Hindi script
        ("पेड़ गिर गया", 3.8),
        ("आवारा कुत्ते", 3.5),
        ("खतरनाक इमारत", 3.5),
        ("दीवार गिरने", 3.5),
        ("जन सुरक्षा", 3.5),
        # Hinglish & Telugu-English code-mixed
        ("ped gir gaya", 3.8),
        ("chettu padipoindi", 3.8),
        ("stray dogs", 3.5),
        ("veedhi kukkalu", 3.5),
        ("awara kutte", 3.5),
    ],
}

CRITICAL_HAZARD_MARKERS = [
    "live electric wire",
    "live wire",
    "electric wire lying",
    "wire lying on the road",
    "spark",
    "sparks",
    "electric shock",
    "electrocution",
    "open manhole",
    "uncovered manhole",
    "fallen tree on wire",
    "fire",
    "transformer blast",
    "short circuit",
    "children falling",
    "sewage entering house",
    "స్పార్క్స్",
    "ఓపెన్ మ్యాన్‌హోల్",
    "కరెంట్ షాక్",
    "కరెంట్ తీగ",
    "మంటలు",
    "चिंगारी",
    "खुला मैनहोल",
    "करंट लगने",
    "खुला बिजली का तार",
    "आग",
    "स्पार्क",
]

HIGH_URGENCY_MARKERS = [
    "accident",
    "accidents",
    "two-wheeler",
    "hospital",
    "school",
    "contaminated",
    "overflowing",
    "entire colony",
    "no drinking water",
    "no water supply",
    "water has not been supplied",
    "without electricity",
    "frequent power",
    "elderly",
    "senior citizens",
    "ప్రమాదాలు",
    "ఆసుపత్రి",
    "పాఠశాల",
    "తీవ్ర ఇబ్బంది",
    "మంచినీటి సరఫరా లేదు",
    "నీటి సరఫరా లేదు",
    "చెత్తను గత వారం రోజులుగా",
    "दुर्घटना",
    "अस्पताल",
    "स्कूल",
    "बुजुर्ग",
    "बीमारी",
    "मच्छर",
    "पानी की सप्लाई नहीं",
    "पानी नहीं आ रहा",
]

GREETING_PATTERNS = [
    r"^\s*(?:hello|hi|hey|good\s+(?:morning|afternoon|evening)|namaste|namaskaram|vanakkam|salaam|adaab)(?:\s*[,!\.]?\s*(?:how\s+are\s+you|who\s+are\s+you|kaise\s+ho|ela\s+unnaru|బాగున్నారా|कैसे\s+हैं)?[\?\!\.]*)?\s*$",
    r"^\s*(?:నమస్కారం|హలో|హాయ్|బాగున్నారా)(?:\s*[\?\!\.]*)?\s*$",
    r"^\s*(?:नमस्ते|नमस्कार|हैलो|हाय|आप\s+कैसे\s+हैं)(?:\s*[\?\!\।]*)?\s*$",
]

UNRELATED_QUERY_PATTERNS = [
    r"\b(?:weather|temperature|rain\s+forecast|cricket|score|movie|film|joke|recipe|stock\s+market|bitcoin|horoscope|astrology|prime\s+minister|president\s+of\s+india|capital\s+of|math|calculate)\b",
    r"(?:ఈరోజు\s+వాతావరణం|క్రికెట్\s+స్కోర్|సినిమా\s+వార్తలు)",
    r"(?:आज\s+का\s+मौसम|क्रिकेट\s+स्कोर|फिल्म|चुटकुला)",
]

GENERAL_QUESTION_PATTERNS = [
    r"^\s*(?:what\s+is\s+janaseva|how\s+(?:do\s+i|to)\s+(?:register|file|submit|track)\s+a\s+complaint|which\s+departments\s+are\s+supported|help\s+me\s+use\s+this\s+app)\b",
]


class DepartmentClassifier:
    """
    Hybrid department classifier, intent detector, multi-issue analyzer, and priority evaluator
    grounded in `/backend/app/core/department_mapping.json`.
    """

    def __init__(self) -> None:
        self.mappings: List[Dict[str, Any]] = settings.get_all_department_records()
        self.by_category: Dict[str, Dict[str, Any]] = {
            item["category"]: item for item in self.mappings
        }
        self.by_id: Dict[str, Dict[str, Any]] = {
            item["department_id"]: item for item in self.mappings
        }

    def normalize_category_name(self, raw_category: Optional[str]) -> Optional[str]:
        """Normalize any Gemini or user category label to the exact 7 official categories."""
        if not raw_category or not isinstance(raw_category, str):
            return None
        clean = raw_category.strip()
        if clean in self.by_category:
            return clean
        lower = clean.lower()
        if lower in CATEGORY_SYNONYMS:
            return CATEGORY_SYNONYMS[lower]
        for official_cat in self.by_category:
            if official_cat.lower() in lower or lower in official_cat.lower():
                return official_cat
        return None

    def get_confidence_band(self, confidence_score: float) -> str:
        """Map numerical confidence score to HIGH / MEDIUM / LOW using configurable thresholds."""
        if confidence_score >= settings.CONFIDENCE_HIGH_THRESHOLD:
            return "HIGH"
        if confidence_score >= settings.CONFIDENCE_MEDIUM_THRESHOLD:
            return "MEDIUM"
        return "LOW"

    def classify_intent(
        self,
        text: str,
        top_category_score: float,
        has_critical_danger: bool,
    ) -> Tuple[str, bool]:
        """
        Determine one of the 6 supported intent types:
        1. CIVIC_GRIEVANCE
        2. GREETING
        3. GENERAL_QUESTION
        4. UNRELATED_QUERY
        5. AMBIGUOUS_REQUEST
        6. EMERGENCY_OR_IMMEDIATE_DANGER
        Returns (intent_type, is_valid_grievance).
        """
        clean_text = (text or "").split("| Location:")[0].strip()
        lower_text = clean_text.lower()

        if has_critical_danger and top_category_score >= 1.5:
            return "EMERGENCY_OR_IMMEDIATE_DANGER", True

        # Check explicit greeting when no civic issue is stated
        if top_category_score < 1.5:
            for pat in GREETING_PATTERNS:
                if re.search(pat, clean_text, flags=re.IGNORECASE):
                    return "GREETING", False

            for pat in GENERAL_QUESTION_PATTERNS:
                if re.search(pat, clean_text, flags=re.IGNORECASE):
                    return "GENERAL_QUESTION", False

            for pat in UNRELATED_QUERY_PATTERNS:
                if re.search(pat, clean_text, flags=re.IGNORECASE):
                    return "UNRELATED_QUERY", False

            # Check if it's a pure question (ends with ? or starts with what/who/when/why/how) with zero civic keywords
            if (
                clean_text.endswith("?")
                or re.match(
                    r"^\s*(?:what|who|where|when|why|how|which|can\s+you\s+tell\s+me)\b",
                    lower_text,
                )
            ) and not any(
                w in lower_text
                for w in (
                    "problem",
                    "issue",
                    "complaint",
                    "not working",
                    "broken",
                    "damage",
                    "supply",
                    "maintaining",
                    "maintenance",
                    "area",
                    "colony",
                    "street",
                    "village",
                )
            ):
                return "UNRELATED_QUERY", False

            return "AMBIGUOUS_REQUEST", False

        return "CIVIC_GRIEVANCE", True

    def classify(
        self,
        text: str,
        detected_language: str = "en",
        extracted_location: Optional[ExtractedLocationData] = None,
        citizen_name: Optional[str] = None,
        problem_duration: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Evaluate complaint text against all 7 official categories, detect intent,
        identify multiple issues, and generate context-aware clarifications.
        """
        clean_text = (text or "").split("| Location:")[0].strip()
        lower_text = clean_text.lower()

        scores: Dict[str, float] = {cat: 0.0 for cat in CATEGORY_LEXICON}
        matched_keywords: Dict[str, List[str]] = {cat: [] for cat in CATEGORY_LEXICON}

        for category, patterns in CATEGORY_LEXICON.items():
            for phrase, weight in patterns:
                if phrase.lower() in lower_text or phrase in clean_text:
                    scores[category] += weight
                    matched_keywords[category].append(phrase)

        word_fallbacks: Dict[str, List[Tuple[str, float]]] = {
            "Water Supply": [
                ("water", 1.6),
                ("నీరు", 1.8),
                ("నీళ్లు", 1.8),
                ("पानी", 1.8),
                ("paani", 1.8),
                ("pani", 1.6),
            ],
            "Roads and Potholes": [
                ("road", 1.6),
                ("రోడ్డు", 1.8),
                ("सड़क", 1.8),
                ("sadak", 1.8),
            ],
            "Garbage Collection": [
                ("waste", 1.6),
                ("smell", 1.2),
                ("mosquitoes", 1.4),
                ("मच्छर", 1.4),
                ("दुर्गंध", 1.4),
                ("దోమలు", 1.4),
            ],
            "Electricity": [
                ("power", 1.6),
                ("current", 1.8),
                ("కరెంట్", 1.8),
                ("voltage", 2.0),
                ("wire", 1.8),
            ],
            "Streetlights": [
                ("darkness", 1.5),
                ("చీకటి", 1.6),
                ("अंधेरा", 1.6),
                ("andhera", 1.6),
            ],
            "Drainage": [
                ("drain", 2.2),
                ("gutter", 2.2),
                ("కాలువ", 2.0),
            ],
            "Public Safety": [
                ("hazard", 2.0),
                ("danger", 1.8),
                ("dangerous", 1.8),
                ("accident", 1.4),
            ],
        }
        for category, kw_list in word_fallbacks.items():
            for kw, w in kw_list:
                if re.search(rf"\b{re.escape(kw)}\b", lower_text) or (
                    not kw.isascii() and kw in clean_text
                ):
                    if (
                        category == "Water Supply"
                        and scores["Drainage"] >= 3.0
                        and scores["Water Supply"] == 0
                    ):
                        continue
                    # Don't let "on the road" in "live electric wire lying on the road" turn Electricity into a Road issue
                    if (
                        category == "Roads and Potholes"
                        and kw == "road"
                        and scores["Electricity"] >= 3.5
                        and "pothole" not in lower_text
                        and "damaged road" not in lower_text
                        and "road problem" not in lower_text
                    ):
                        continue
                    scores[category] += w
                    matched_keywords[category].append(kw)

        # Disambiguation: If Streetlights has a direct match and no transformer/voltage/house power cut is mentioned, prioritize Streetlights
        if scores["Streetlights"] >= 3.5 and not any(
            x in lower_text
            for x in (
                "transformer",
                "voltage",
                "power cut",
                "power outage",
                "live wire",
                "electric wire",
                "ట్రాన్స్‌ఫార్మర్",
                "ट्रांसफार्मर",
            )
        ):
            scores["Streetlights"] += 1.5

        # Sort by score descending, then by ESSENTIAL_SERVICE_TIEBREAKER so Water Supply beats Roads and Potholes on a tie
        ranked = sorted(
            scores.items(),
            key=lambda kv: (round(kv[1], 1), ESSENTIAL_SERVICE_TIEBREAKER.get(kv[0], 0)),
            reverse=True,
        )
        top_category, top_score = ranked[0]

        has_critical_danger = any(
            m in lower_text or m in clean_text for m in CRITICAL_HAZARD_MARKERS
        )
        intent_type, is_valid_grievance = self.classify_intent(
            text=clean_text,
            top_category_score=top_score,
            has_critical_danger=has_critical_danger,
        )

        # Handle non-grievance or ambiguous intents (GREETING, UNRELATED_QUERY, GENERAL_QUESTION, AMBIGUOUS_REQUEST)
        if not is_valid_grievance:
            clarification_q = self.build_contextual_clarification(
                detected_language=detected_language,
                intent_type=intent_type,
                department_category=None,
                candidate_categories=[],
                location=extracted_location,
            )
            return {
                "intent_type": intent_type,
                "is_valid_grievance": False,
                "department_category": None,
                "department_name": None,
                "department_id": None,
                "classification_explanation": self._build_intent_explanation(intent_type),
                "confidence_score": 0.25 if intent_type == "AMBIGUOUS_REQUEST" else 0.95,
                "confidence_band": "LOW",
                "secondary_categories": [],
                "identified_issues": [],
                "needs_clarification": True,
                "clarification_question": clarification_q,
            }

        # Identify secondary categories for multi-issue complaints (Test Case 7 & 10)
        secondary_categories = [
            cat for cat, sc in ranked[1:] if sc >= 2.8 and cat != top_category
        ]

        selected_record = self.by_category[top_category]
        confidence = min(0.98, round(0.56 + (top_score / 11.0), 2))
        confidence_band = self.get_confidence_band(confidence)

        # Build structured identified_issues list (supports single and multiple grievances)
        identified_issues = self.build_identified_issues(
            text=clean_text,
            primary_category=top_category,
            secondary_categories=secondary_categories,
            scores=scores,
            location=extracted_location,
        )

        # Check if location is missing so we can ask a helpful clarification question
        location_missing = (
            extracted_location is None
            or not extracted_location.has_any_primary_location()
        )
        needs_clarification = bool(
            confidence_band == "LOW" or location_missing
        )

        clarification_q: Optional[str] = None
        if secondary_categories or needs_clarification or (
            extracted_location and not extracted_location.landmark
        ):
            clarification_q = self.build_contextual_clarification(
                detected_language=detected_language,
                intent_type=intent_type,
                department_category=top_category,
                candidate_categories=(
                    [top_category] + secondary_categories if secondary_categories else []
                ),
                location=extracted_location,
                problem_duration=problem_duration,
                citizen_name=citizen_name,
            )

        matched_Sample = ", ".join(matched_keywords[top_category][:3])
        explanation = (
            f"Classified under '{selected_record['category']}' and routed to "
            f"{selected_record['department_name']} ({selected_record['department_id']}) "
            f"based on semantic issue indicators ({matched_Sample or top_category})."
        )
        if secondary_categories:
            explanation += (
                f" Additional separate civic issue(s) detected: {', '.join(secondary_categories)}."
            )

        return {
            "intent_type": intent_type,
            "is_valid_grievance": True,
            "department_category": selected_record["category"],
            "department_name": selected_record["department_name"],
            "department_id": selected_record["department_id"],
            "classification_explanation": explanation,
            "confidence_score": confidence,
            "confidence_band": confidence_band,
            "secondary_categories": secondary_categories,
            "identified_issues": identified_issues,
            "needs_clarification": needs_clarification,
            "clarification_question": clarification_q,
        }

    def build_identified_issues(
        self,
        text: str,
        primary_category: str,
        secondary_categories: List[str],
        scores: Dict[str, float],
        location: Optional[ExtractedLocationData] = None,
    ) -> List[Dict[str, Any]]:
        """Build separate structured issue cards for single or multi-issue statements."""
        all_cats = [primary_category] + [
            c for c in secondary_categories if c in self.by_category and c != primary_category
        ]
        loc_label: Optional[str] = None
        if location:
            parts = [
                location.street,
                location.area,
                location.village or location.town or location.city,
                location.district,
            ]
            loc_label = ", ".join([p for p in parts if p]) or None

        clauses = [
            c.strip()
            for c in re.split(
                r"\b(?:and\s+also|and\s+the|and|also|మరియు|तथा|और)\b",
                text,
                flags=re.IGNORECASE,
            )
            if c.strip()
        ]

        issues: List[Dict[str, Any]] = []
        for idx, cat in enumerate(all_cats, start=1):
            rec = self.by_category.get(cat)
            if not rec:
                continue
            sc = scores.get(cat, 3.5)
            conf = min(0.98, round(0.56 + (sc / 11.0), 2))
            # Match the most relevant clause if multi-issue
            matched_clause = text
            if len(all_cats) > 1 and clauses:
                for cl in clauses:
                    cl_lower = cl.lower()
                    for phrase, _ in CATEGORY_LEXICON.get(cat, []):
                        if phrase.lower() in cl_lower:
                            matched_clause = cl
                            break
            prio, _ = self.assess_priority(
                text=matched_clause,
                department_category=cat,
                problem_duration=None,
                affected_people=None,
                needs_clarification=False,
            )
            issues.append(
                {
                    "issue_number": idx,
                    "category": rec["category"],
                    "department_name": rec["department_name"],
                    "department_id": rec["department_id"],
                    "problem_summary": f"{rec['category']}: {matched_clause[:140]}",
                    "priority": prio,
                    "confidence_score": conf,
                    "extracted_location": loc_label,
                }
            )
        return issues

    def assess_priority(
        self,
        text: str,
        department_category: Optional[str],
        problem_duration: Optional[str],
        affected_people: Optional[str],
        needs_clarification: bool = False,
        intent_type: str = "CIVIC_GRIEVANCE",
    ) -> Tuple[str, str]:
        """
        Assess provisional urgency level ('low', 'normal', 'high', 'critical')
        and return (priority, priority_reason).
        """
        lower_text = (text or "").lower()
        cat_label = department_category or "Civic"

        if intent_type in ("GREETING", "UNRELATED_QUERY", "GENERAL_QUESTION"):
            return (
                "low",
                f"No civic grievance urgency applicable for {intent_type}.",
            )

        # 1. Check explicit Critical safety hazards
        matched_critical = [
            m for m in CRITICAL_HAZARD_MARKERS if m in lower_text or m in (text or "")
        ]
        if matched_critical or intent_type == "EMERGENCY_OR_IMMEDIATE_DANGER":
            hazard_name = matched_critical[0] if matched_critical else "immediate public safety danger"
            return (
                "critical",
                f"Provisional Critical priority assigned due to explicit public safety hazard ({hazard_name}) requiring urgent field attention.",
            )

        # 2. Check High urgency indicators
        matched_high = [
            m for m in HIGH_URGENCY_MARKERS if m in lower_text or m in (text or "")
        ]
        has_multi_day_duration = False
        if problem_duration:
            if re.search(
                r"\b([3-9]|\d{2,}|three|four|five|six|seven|ten|teen|char|paanch|moodu|nalugu|మూడు|నాలుగు|ఐదు|వారం|तीन|चार|पांच|पाँच|सप्ताह|हफ्तों|వారాలుగా|weeks?|yesterday\s+evening|last\s+night)\b",
                problem_duration,
                flags=re.IGNORECASE,
            ):
                has_multi_day_duration = True

        # Do not escalate a single streetlight out for 2 days to High
        if department_category == "Streetlights" and not matched_critical and not affected_people:
            if problem_duration and re.search(r"\b(?:two|2|రెండు|दो)\s*(?:days?|రోజులు|दिन)\b", problem_duration, flags=re.IGNORECASE):
                return (
                    "normal",
                    "Provisional Normal priority for standard Streetlights maintenance request.",
                )

        if matched_high or has_multi_day_duration or affected_people:
            reasons: List[str] = []
            if matched_high:
                reasons.append(f"severity indicator ('{matched_high[0]}')")
            if problem_duration:
                reasons.append(f"reported duration ({problem_duration})")
            if affected_people:
                reasons.append(f"impact on {affected_people}")
            reason_str = (
                ", ".join(reasons)
                if reasons
                else f"sustained {cat_label} service disruption"
            )
            return (
                "high",
                f"Provisional High priority based on {reason_str}.",
            )

        # 3. Check Low priority (ambiguous or minor maintenance)
        if intent_type == "AMBIGUOUS_REQUEST" or (needs_clarification and not department_category):
            return (
                "low",
                "Provisional Low priority pending citizen clarification of specific civic issue details.",
            )

        if any(w in lower_text for w in ("minor", "small", "routine", "suggestion")):
            return (
                "low",
                f"Provisional Low priority for routine {cat_label} maintenance request.",
            )

        # 4. Default Normal priority
        return (
            "normal",
            f"Provisional Normal priority for standard {cat_label} grievance routing.",
        )

    @staticmethod
    def build_safety_advisory(
        text: str,
        intent_type: str,
        priority: str,
        department_category: Optional[str],
        detected_language: str = "en",
    ) -> Optional[str]:
        """Return an urgent public safety advisory for immediate hazards without promising government response."""
        if intent_type != "EMERGENCY_OR_IMMEDIATE_DANGER" and priority != "critical":
            return None

        lang = (detected_language or "en").lower()
        if lang.startswith("te"):
            return (
                "భద్రతా సూచన: ఇది తక్షణ ప్రమాదకర పరిస్థితిగా కనిపిస్తోంది. దయచేసి ప్రమాద స్థలానికి (కరెంట్ తీగలు / ఓపెన్ మ్యాన్‌హోల్) దూరంగా ఉండండి. "
                "తక్షణ సహాయం కోసం అత్యవసర సేవలను (112 లేదా విద్యుత్ అత్యవసర నంబర్ 1912) సంప్రదించండి."
            )
        if lang.startswith("hi"):
            return (
                "सुरक्षा परामर्श: यह तत्काल खतरे की स्थिति प्रतीत होती है। कृपया खतरे वाले स्थान (खुले बिजली के तार / मैनहोल) से सुरक्षित दूरी बनाए रखें "
                "और तत्काल सहायता के लिए आपातकालीन सेवाओं (112 या बिजली हेल्पलाइन 1912) से संपर्क करें।"
            )
        return (
            "URGENT SAFETY ADVISORY: This report indicates an immediate physical safety hazard. "
            "Please keep a safe distance from the hazard area (such as live electric wires or open manholes), warn nearby pedestrians, "
            "and contact emergency services immediately (Dial 112 or Electricity Emergency Helpline 1912)."
        )

    @staticmethod
    def _build_intent_explanation(intent_type: str) -> str:
        if intent_type == "GREETING":
            return "Detected a conversational greeting rather than a civic grievance. No complaint ticket is generated."
        if intent_type == "UNRELATED_QUERY":
            return "Detected a general/unrelated query outside municipal & civic grievance redressal."
        if intent_type == "GENERAL_QUESTION":
            return "Detected a general question about using the JANASEVA AI platform."
        if intent_type == "AMBIGUOUS_REQUEST":
            return "The statement indicates dissatisfaction in the area but does not specify which civic service is affected."
        return "Analyzed citizen input for civic grievance classification."

    @staticmethod
    def build_contextual_clarification(
        detected_language: str,
        intent_type: str,
        department_category: Optional[str],
        candidate_categories: List[str],
        location: Optional[ExtractedLocationData] = None,
        problem_duration: Optional[str] = None,
        citizen_name: Optional[str] = None,
    ) -> str:
        """
        Generate natural, respectful, multilingual clarification or redirection messages
        in English, Telugu, Hindi, Hinglish, or Telugu-English.
        Acknowledges details already provided by the citizen and asks only for what is missing.
        """
        lang = (detected_language or "en").lower()

        # 1. GREETING
        if intent_type == "GREETING":
            if lang == "te":
                return (
                    "నమస్కారం! నేను జనసేవ AI (JANASEVA AI) పౌర ఫిర్యాదుల సహాయకుడిని. "
                    "మంచినీటి సరఫరా, రోడ్లు/గుంతలు, చెత్త సేకరణ, విద్యుత్, వీధి దీపాలు, డ్రైనేజీ లేదా ప్రజా భద్రతకు సంబంధించిన సమస్యలను నమోదు చేయడంలో నేను మీకు సహాయం చేయగలను. దయచేసి మీ సమస్యను తెలియజేయండి."
                )
            if lang in ("hi", "hi-en"):
                return (
                    "नमस्ते! मैं जनसेवा AI (JANASEVA AI) नागरिक शिकायत सहायक हूँ। "
                    "मैं जलापूर्ति, सड़क/गड्ढे, कचरा संग्रहण, बिजली, स्ट्रीट लाइट, ड्रेनेज या जन सुरक्षा से जुड़ी शिकायतों को दर्ज करने में आपकी सहायता कर सकता हूँ। कृपया अपनी समस्या बताएं।"
                )
            return (
                "Hello! Welcome to JANASEVA AI, your multilingual citizen grievance assistant. "
                "I can help you register civic complaints regarding Water Supply, Roads and Potholes, Garbage Collection, Electricity, Streetlights, Drainage, or Public Safety. How may I assist you today?"
            )

        # 2. UNRELATED_QUERY or GENERAL_QUESTION
        if intent_type in ("UNRELATED_QUERY", "GENERAL_QUESTION"):
            if lang == "te":
                return (
                    "నేను జనసేవ AI పౌర ఫిర్యాదుల సహాయకుడిని. వాతావరణం లేదా సాధారణ ప్రశ్నలకు సమాధానం ఇవ్వలేను, "
                    "కానీ మీ ప్రాంతంలోని మంచినీరు, రోడ్లు, చెత్త సేకరణ, విద్యుత్, వీధి దీపాలు, డ్రైనేజీ లేదా ప్రజా భద్రత సమస్యలపై ఫిర్యాదు నమోదు చేయడంలో సహాయం చేయగలను."
                )
            if lang in ("hi", "hi-en"):
                return (
                    "मैं जनसेवा AI नागरिक शिकायत सहायक हूँ। मैं मौसम या सामान्य ज्ञान के प्रश्नों का उत्तर नहीं दे सकता, "
                    "लेकिन यदि आपके क्षेत्र में पानी, सड़क, कचरा, बिजली, स्ट्रीट लाइट, नाली या जन सुरक्षा से जुड़ी कोई समस्या है, तो कृपया बताएं ताकि मैं आपकी शिकायत तैयार कर सकूँ।"
                )
            return (
                "I am JANASEVA AI, an official civic grievance assistant. I cannot answer weather or general-knowledge questions, "
                "but I can help you register municipal and rural civic grievances regarding Water Supply, Roads and Potholes, Garbage Collection, Electricity, Streetlights, Drainage, or Public Safety. Please describe any civic issue in your area."
            )

        # 3. AMBIGUOUS_REQUEST (Low confidence / no specific department)
        if intent_type == "AMBIGUOUS_REQUEST" or not department_category:
            if lang == "te":
                return (
                    "మీ ప్రాంతంలో సమస్య ఉన్నట్లు అర్థమైంది, కానీ నిర్దిష్టంగా ఏ విభాగానికి సంబంధించిన సమస్య అనేది స్పష్టంగా లేదు. "
                    "దయచేసి ఇది మంచినీటి సరఫరా, రోడ్లు/గుంతలు, చెత్త సేకరణ, విద్యుత్, వీధి దీపాలు, డ్రైనేజీ లేదా ప్రజా భద్రతకు సంబంధించినదా అని మరియు మీ గ్రామం/ప్రాంతం పేరును తెలియజేయగలరు."
                )
            if lang == "te-en":
                return (
                    "Mee area lo problem unnattu arthamaindi. Dayachesi idi Water Supply, Roads & Potholes, Garbage, Electricity, Streetlights, Drainage leda Public Safety lo deniki sambandhinchina samasya mariyu exact location/landmark ento cheppagalaru?"
                )
            if lang == "hi":
                return (
                    "मैं आपकी सहायता करना चाहता हूँ। कृपया स्पष्ट करें कि आपके क्षेत्र में किस प्रकार की नागरिक समस्या है "
                    "(जैसे: जलापूर्ति, सड़क और गड्ढे, कचरा संग्रहण, बिजली, स्ट्रीट लाइट, नाली/सीवर या जन सुरक्षा) और प्रभावित गांव/मोहल्ले तथा नजदीकी लैंडमार्क का नाम बताएं।"
                )
            if lang == "hi-en":
                return (
                    "Main aapki complaint darj karne mein madad kar sakta hoon. Kripya batayein ki aapke area mein kis cheez ki problem hai "
                    "(Water Supply, Roads & Potholes, Garbage, Electricity, Streetlights, Drainage ya Public Safety) aur wahan ka exact location aur landmark kya hai?"
                )
            return (
                "I would like to help you register this grievance. Could you please clarify the specific civic issue you are facing "
                "(Water Supply, Roads and Potholes, Garbage Collection, Electricity, Streetlights, Drainage, or Public Safety) and mention the affected village, town, or locality along with a nearby landmark?"
            )

        # 4. MULTIPLE ISSUES DETECTED
        if len(candidate_categories) > 1:
            cats_joined = ", ".join(candidate_categories)
            if lang == "te":
                return (
                    f"మీ ఫిర్యాదులో {len(candidate_categories)} వేర్వేరు సమస్యలు ({cats_joined}) గుర్తించబడ్డాయి. "
                    f"ప్రస్తుతానికి '{candidate_categories[0]}' ప్రధాన విభాగంగా ఎంపిక చేయబడింది. మీరు ప్రతి సమస్యను సమీక్షించి విడివిడిగా నమోదు చేయవచ్చు."
                )
            if lang in ("hi", "hi-en"):
                return (
                    f"आपकी शिकायत में {len(candidate_categories)} अलग-अलग नागरिक समस्याएं ({cats_joined}) पहचानी गई हैं। "
                    f"मुख्य विभाग के रूप में '{candidate_categories[0]}' को चुना गया है; आप समीक्षा के बाद प्रत्येक समस्या की पुष्टि कर सकते हैं।"
                )
            return (
                f"We identified {len(candidate_categories)} separate civic issues in your statement ({cats_joined}). "
                f"We have prepared '{candidate_categories[0]}' as the primary grievance and listed each issue separately for your review."
            )

        # 5. CONTEXT-AWARE LOCATION / LANDMARK / DURATION FOLLOW-UP (Conversational Intelligence)
        known_loc_parts: List[str] = []
        if location:
            if location.village:
                known_loc_parts.append(f"{location.village} village")
            elif location.town:
                known_loc_parts.append(location.town)
            elif location.city:
                known_loc_parts.append(location.city)
            if location.area:
                known_loc_parts.append(location.area)
            if location.street:
                known_loc_parts.append(location.street)
            if location.landmark:
                known_loc_parts.append(location.landmark)

        has_settlement_or_area = bool(
            location and (location.has_settlement() or location.has_locality_or_street())
        )
        has_landmark = bool(location and location.landmark)

        if not has_settlement_or_area and not has_landmark:
            if lang == "te":
                return (
                    f"ఈ {department_category} ఫిర్యాదును నమోదు చేయడంలో నేను మీకు సహాయం చేయగలను. "
                    "దయచేసి సమస్య ఉన్న గ్రామం/పట్టణం, వీధి/కాలనీ పేరు మరియు దగ్గరలోని ల్యాండ్‌మార్క్ (గుర్తు) తెలియజేయగలరు?"
                )
            if lang in ("hi", "hi-en"):
                return (
                    f"मैं इस {department_category} शिकायत को दर्ज करने में आपकी मदद कर सकता हूँ। "
                    "कृपया बताएं कि कौन सा गांव, शहर या मोहल्ला प्रभावित है और पास का कोई लैंडमार्क (पहचान चिन्ह) क्या है?"
                )
            return (
                f"I can help you register this {department_category} complaint. "
                "Could you please tell me which village, town, or area is affected and mention a nearby landmark?"
            )

        if has_settlement_or_area and not has_landmark:
            noted_str = ", ".join(known_loc_parts)
            name_ack = f", {citizen_name}" if citizen_name else ""
            if lang == "te":
                return (
                    f"ధన్యవాదాలు{name_ack}. ప్రాంతాన్ని '{noted_str}'గా నమోదు చేశాము. "
                    "అధికారులు సులభంగా గుర్తించడానికి దయచేసి మీ వీధి/కాలనీ పేరు మరియు దగ్గరలోని ల్యాండ్‌మార్క్ (పాఠశాల, గుడి మొదలైనవి) తెలియజేయగలరు?"
                )
            if lang in ("hi", "hi-en"):
                return (
                    f"धन्यवाद{name_ack}। मैंने स्थान '{noted_str}' नोट कर लिया है। "
                    "कृपया अपनी गली/मोहल्ले का नाम और पास का कोई लैंडमार्क (जैसे स्कूल, मंदिर या चौराहा) बताएं ताकि शिकायत पूरी की जा सके।"
                )
            if citizen_name:
                return (
                    f"Thank you, {citizen_name}. I have noted the location as {noted_str}. "
                    "Could you please mention your specific street/area name and a nearby landmark (such as a school, temple, or junction) to complete the complaint?"
                )
            return (
                f"Thank you. I have noted the location as {noted_str}. "
                "Could you please mention a nearby landmark (such as a school, temple, or junction) and your full name to complete the complaint?"
            )

        # Both location and landmark are known! Acknowledge them and ask only for duration or remaining mandatory fields without repeating location questions
        noted_str = ", ".join(known_loc_parts)
        if not problem_duration:
            if lang == "te":
                return (
                    f"ధన్యవాదాలు. స్థలాన్ని '{noted_str}'గా నమోదు చేశాము. "
                    "ఈ సమస్య ఎన్ని రోజులుగా ఉందో తెలియజేయగలరా?"
                )
            if lang in ("hi", "hi-en"):
                return (
                    f"धन्यवाद। मैंने स्थान '{noted_str}' नोट कर लिया है। "
                    "क्या आप बता सकते हैं कि यह समस्या कब से बनी हुई है?"
                )
            return (
                f"Thank you. I have noted the location as {noted_str}. "
                "Could you tell me how long this problem has existed?"
            )

        return (
            f"Thank you. I have noted the {department_category} issue at {noted_str}. "
            "Please review the prepared complaint below and confirm your name before submitting."
        )


department_classifier = DepartmentClassifier()
