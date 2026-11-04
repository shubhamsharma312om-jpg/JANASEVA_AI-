"""
JANASEVA AI — Multilingual Language Identification Module
Detects:
- Telugu ('te')
- Hindi ('hi')
- English ('en')
- Hinglish / Hindi-English code-mixed ('hi-en')
- Telugu-English code-mixed ('te-en')
- Other Indian scripts ('ta', 'kn', 'ml', 'bn', 'gu', 'pa', 'or', 'ur')
"""

import re
from typing import Tuple

# Common Romanized Telugu (Telugu-English code-mixed) lexical tokens
ROMAN_TELUGU_MARKERS = {
    "maa", "ma", "lo", "ledu", "leru", "ravatledu", "vastundi", "vastunnayi",
    "poindi", "poyindi", "avutundi", "avuthundi", "cheyatledu", "pani",
    "daggara", "nundi", "rojuluga", "rojula", "manchineeti", "neellu",
    "veedhi", "dayachesi", "parishkarinchandi", "ventane", "chala",
    "ibbandi", "padutunnam", "paduthunnam", "valla", "kuda", "ikkada",
    "akkada", "kalani", "vaallu", "emi", "kavatledu", "sariga", "rakapovadam",
    "pothundi", "vasana", "domalu", "chetha", "kaluva", "cheruvu",
}

# Common Romanized Hindi (Hinglish) lexical tokens
ROMAN_HINDI_MARKERS = {
    "mein", "main", "hai", "hain", "nahi", "nahin", "paani", "pani",
    "bijli", "kachra", "kuda", "sadak", "gaddhe", "gaddha", "gali",
    "pichle", "pichhle", "dinon", "dino", "se", "aa", "raha", "rahi",
    "rahe", "batti", "band", "kharab", "kripya", "paas", "ke", "ka",
    "ki", "ko", "log", "pareshan", "mohalla", "mohalle", "naali", "nali",
    "ganda", "badbu", "macchar", "machhar", "khambe", "khamba", "taar",
    "humare", "hamare", "yahan", "wahan", "bahut", "dikkat", "samasya",
    "jaldi", "theek", "karwaye", "karo", "subah", "raat", "kal",
}

ENGLISH_STOPWORDS = {
    "the", "is", "are", "was", "were", "has", "have", "been", "not",
    "working", "since", "near", "road", "water", "supply", "street",
    "light", "lights", "garbage", "drainage", "overflow", "power",
    "electricity", "pothole", "potholes", "broken", "damaged", "please",
    "resolve", "issue", "problem", "complaint", "days", "colony", "area",
}


class LanguageDetector:
    """Identifies the primary language or code-mixed variety of a citizen complaint."""

    @staticmethod
    def detect(text: str) -> str:
        """
        Return one of:
        - 'te'    (Telugu script)
        - 'hi'    (Hindi Devanagari script)
        - 'te-en' (Telugu-English code-mixed)
        - 'hi-en' (Hinglish / Hindi-English code-mixed)
        - 'en'    (English)
        - 'ta', 'kn', 'ml', 'bn', 'gu', 'pa', 'or', 'ur' (Other Indian scripts)
        """
        if not text or not text.strip():
            return "en"

        telugu_chars = len(re.findall(r"[\u0C00-\u0C7F]", text))
        devanagari_chars = len(re.findall(r"[\u0900-\u097F]", text))
        tamil_chars = len(re.findall(r"[\u0B80-\u0BFF]", text))
        kannada_chars = len(re.findall(r"[\u0C80-\u0CFF]", text))
        malayalam_chars = len(re.findall(r"[\u0D00-\u0D7F]", text))
        bengali_chars = len(re.findall(r"[\u0980-\u09FF]", text))
        gujarati_chars = len(re.findall(r"[\u0A80-\u0AFF]", text))
        gurmukhi_chars = len(re.findall(r"[\u0A00-\u0A7F]", text))
        odia_chars = len(re.findall(r"[\u0B00-\u0B7F]", text))
        arabic_urdu_chars = len(re.findall(r"[\u0600-\u06FF]", text))
        latin_chars = len(re.findall(r"[A-Za-z]", text))

        # Check native Indian scripts first
        if telugu_chars > 0 and telugu_chars >= devanagari_chars:
            # If substantial Latin words are mixed with Telugu script (excluding trailing "| Location:")
            main_body = text.split("| Location:")[0]
            latin_words_in_body = re.findall(r"\b[A-Za-z]{3,}\b", main_body)
            if len(latin_words_in_body) >= 4 and latin_chars > telugu_chars * 0.45:
                return "te-en"
            return "te"

        if devanagari_chars > 0:
            main_body = text.split("| Location:")[0]
            latin_words_in_body = re.findall(r"\b[A-Za-z]{3,}\b", main_body)
            if len(latin_words_in_body) >= 4 and latin_chars > devanagari_chars * 0.45:
                return "hi-en"
            return "hi"

        if tamil_chars > 3:
            return "ta"
        if kannada_chars > 3:
            return "kn"
        if malayalam_chars > 3:
            return "ml"
        if bengali_chars > 3:
            return "bn"
        if gujarati_chars > 3:
            return "gu"
        if gurmukhi_chars > 3:
            return "pa"
        if odia_chars > 3:
            return "or"
        if arabic_urdu_chars > 3:
            return "ur"

        # Roman script analysis: distinguish English vs Hinglish ('hi-en') vs Telugu-English ('te-en')
        tokens = [t.lower() for t in re.findall(r"\b[a-zA-Z]+\b", text)]
        if not tokens:
            return "en"

        te_hits = sum(1 for t in tokens if t in ROMAN_TELUGU_MARKERS)
        hi_hits = sum(1 for t in tokens if t in ROMAN_HINDI_MARKERS)

        # Disambiguate shared word 'pani' (Telugu 'work' vs Hindi 'water')
        if "pani" in tokens:
            if any(w in tokens for w in ("cheyatledu", "avutundi", "ledu", "rojuluga", "daggara")):
                te_hits += 1
                hi_hits = max(0, hi_hits - 1)

        if te_hits >= 2 and te_hits > hi_hits:
            return "te-en"
        if hi_hits >= 2 and hi_hits >= te_hits:
            return "hi-en"

        return "en"

    @staticmethod
    def to_core_language_code(detected_language: str) -> str:
        """Map detected language code to JANASEVA core language ('en', 'te', 'hi')."""
        code = (detected_language or "en").lower().strip()
        if code in ("te", "te-in"):
            return "te"
        if code in ("hi", "hi-in"):
            return "hi"
        if code == "te-en":
            return "te"
        if code == "hi-en":
            return "hi"
        return "en"

    @staticmethod
    def get_display_label(detected_language: str) -> Tuple[str, str]:
        """Return (display_name, script_type) for UI presentation."""
        mapping = {
            "te": ("Telugu (తెలుగు)", "Telugu"),
            "hi": ("Hindi (हिन्दी)", "Devanagari"),
            "en": ("English", "Latin"),
            "hi-en": ("Hinglish (Hindi-English Code-Mixed)", "Latin / Code-Mixed"),
            "te-en": ("Telugu-English (Code-Mixed)", "Latin / Code-Mixed"),
            "ta": ("Tamil (தமிழ்)", "Tamil"),
            "kn": ("Kannada (ಕನ್ನಡ)", "Kannada"),
            "ml": ("Malayalam (മലയാളം)", "Malayalam"),
            "mr": ("Marathi (मराठी)", "Devanagari"),
            "bn": ("Bengali (বাংলা)", "Bengali"),
            "gu": ("Gujarati (ગુજરાતી)", "Gujarati"),
            "pa": ("Punjabi (ਪੰਜਾਬੀ)", "Gurmukhi"),
            "or": ("Odia (ଓଡ଼ିଆ)", "Odia"),
            "ur": ("Urdu (اردو)", "Perso-Arabic"),
        }
        return mapping.get((detected_language or "en").lower(), ("English", "Latin"))


language_detector = LanguageDetector()
