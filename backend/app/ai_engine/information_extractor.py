"""
JANASEVA AI — Zero-Hallucination Structured Information Extractor (Phase 5 Upgrade)
Strictly extracts and validates ONLY information explicitly stated in the citizen's complaint.
Never fabricates names, phone numbers, emails, addresses, landmarks, dates, or designations.
All unmentioned fields remain None (serialized as JSON null).
"""

import re
from typing import Any, Dict, List, Optional, Tuple
from app.ai_engine.base import ExtractedLocationData

# Major cities & towns across Andhra Pradesh, Telangana & India (matched only when explicitly present)
KNOWN_CITIES = [
    ("vijayawada", "Vijayawada"),
    ("విజయవాడ", "Vijayawada"),
    ("विजयवाड़ा", "Vijayawada"),
    ("visakhapatnam", "Visakhapatnam"),
    ("vizag", "Visakhapatnam"),
    ("విశాఖపట్నం", "Visakhapatnam"),
    ("guntur", "Guntur"),
    ("గుంటూరు", "Guntur"),
    ("tirupati", "Tirupati"),
    ("తిరుపతి", "Tirupati"),
    ("nellore", "Nellore"),
    ("నెల్లూరు", "Nellore"),
    ("kurnool", "Kurnool"),
    ("కర్నూలు", "Kurnool"),
    ("rajahmundry", "Rajahmundry"),
    ("రాజమండ్రి", "Rajahmundry"),
    ("kakinada", "Kakinada"),
    ("కాకినాడ", "Kakinada"),
    ("eluru", "Eluru"),
    ("ఏలూరు", "Eluru"),
    ("ongole", "Ongole"),
    ("ఒంగోలు", "Ongole"),
    ("kadapa", "Kadapa"),
    ("కడప", "Kadapa"),
    ("anantapur", "Anantapur"),
    ("అనంతపురం", "Anantapur"),
    ("vizianagaram", "Vizianagaram"),
    ("విజయనగరం", "Vizianagaram"),
    ("srikakulam", "Srikakulam"),
    ("శ్రీకాకుళం", "Srikakulam"),
    ("machilipatnam", "Machilipatnam"),
    ("మచిలీపట్నం", "Machilipatnam"),
    ("amaravati", "Amaravati"),
    ("అమరావతి", "Amaravati"),
    ("secunderabad", "Secunderabad"),
    ("సికింద్రాబాద్", "Secunderabad"),
    ("सिकंदराबाद", "Secunderabad"),
    ("hyderabad", "Hyderabad"),
    ("హైదరాబాద్", "Hyderabad"),
    ("हैदराबाद", "Hyderabad"),
    ("cyberabad", "Cyberabad"),
    ("warangal", "Warangal"),
    ("వరంగల్", "Warangal"),
    ("hanamkonda", "Hanamkonda"),
    ("హన్మకొండ", "Hanamkonda"),
    ("nizamabad", "Nizamabad"),
    ("నిజామాబాద్", "Nizamabad"),
    ("khammam", "Khammam"),
    ("ఖమ్మం", "Khammam"),
    ("karimnagar", "Karimnagar"),
    ("కరీంనగర్", "Karimnagar"),
    ("ramagundam", "Ramagundam"),
    ("రామగుండం", "Ramagundam"),
    ("mahabubnagar", "Mahabubnagar"),
    ("మహబూబ్‌నగర్", "Mahabubnagar"),
    ("nalgonda", "Nalgonda"),
    ("నల్గొండ", "Nalgonda"),
    ("adilabad", "Adilabad"),
    ("ఆదిలాబాద్", "Adilabad"),
    ("suryapet", "Suryapet"),
    ("సూర్యాపేట", "Suryapet"),
    ("siddipet", "Siddipet"),
    ("సిద్దిపేట", "Siddipet"),
    ("miryalaguda", "Miryalaguda"),
    ("మిర్యాలగూడ", "Miryalaguda"),
    ("kothagudem", "Kothagudem"),
    ("కొత్తగూడెం", "Kothagudem"),
    ("bhadrachalam", "Bhadrachalam"),
    ("భద్రాచలం", "Bhadrachalam"),
    ("sangaraddy", "Sangareddy"),
    ("sangareddy", "Sangareddy"),
    ("సంగారెడ్డి", "Sangareddy"),
    ("medak", "Medak"),
    ("మెదక్", "Medak"),
    ("vikarabad", "Vikarabad"),
    ("వికారాబాద్", "Vikarabad"),
    ("kamareddy", "Kamareddy"),
    ("కామారెడ్డి", "Kamareddy"),
    ("mancherial", "Mancherial"),
    ("మంచిర్యాల", "Mancherial"),
    ("jagtial", "Jagtial"),
    ("జగిత్యాల", "Jagtial"),
]

KNOWN_DISTRICTS = [
    ("nalgonda", "Nalgonda"),
    ("నల్గొండ", "Nalgonda"),
    ("नलगोंडा", "Nalgonda"),
    ("medchal-malkajgiri", "Medchal-Malkajgiri"),
    ("medchal", "Medchal-Malkajgiri"),
    ("rangareddy", "Rangareddy"),
    ("ranga reddy", "Rangareddy"),
    ("రంగారెడ్డి", "Rangareddy"),
    ("रंगारेड्डी", "Rangareddy"),
    ("sangareddy", "Sangareddy"),
    ("krishna", "Krishna"),
    ("guntur", "Guntur"),
    ("warangal", "Warangal"),
    ("khammam", "Khammam"),
    ("nizamabad", "Nizamabad"),
    ("karimnagar", "Karimnagar"),
    ("mahabubnagar", "Mahabubnagar"),
    ("adilabad", "Adilabad"),
]

# Known localities / areas in Hyderabad, Vijayawada & pilot regions (matched only when explicitly present)
KNOWN_AREAS = [
    ("kukatpally housing board phase 3", "Kukatpally Housing Board Phase 3"),
    ("kukatpally phase 3", "Kukatpally Phase 3"),
    ("కుకట్‌పల్లి ఫేజ్ 3", "కుకట్‌పల్లి ఫేజ్ 3"),
    ("కుకట్ పల్లి ఫేజ్ 3", "కుకట్‌పల్లి ఫేజ్ 3"),
    ("కూకట్‌పల్లి ఫేజ్ 3", "కూకట్‌పల్లి ఫేజ్ 3"),
    ("kukatpally", "Kukatpally"),
    ("kp-hb", "KPHB Colony"),
    ("kphb", "KPHB Colony"),
    ("కుకట్‌పల్లి", "కుకట్‌పల్లి"),
    ("కూకట్‌పల్లి", "కూకట్‌పల్లి"),
    ("కుకట్ పల్లి", "కుకట్‌పల్లి"),
    ("कुकटपल्ली", "कुकटपल्ली"),
    ("banjara hills", "Banjara Hills"),
    ("బంజారా హిల్స్", "బంజారా హిల్స్"),
    ("बंजारा हिल्स", "बंजारा हिल्स"),
    ("jubilee hills", "Jubilee Hills"),
    ("జూబ్లీ హిల్స్", "జూబ్లీ హిల్స్"),
    ("जुबली हिल्स", "जुबली हिल्स"),
    ("madhapur", "Madhapur"),
    ("మాదాపూర్", "మాదాపూర్"),
    ("माधापुर", "माधापुर"),
    ("narayanguda", "Narayanguda"),
    ("నారాయణగూడ", "Narayanguda"),
    ("नारायणगुडा", "Narayanguda"),
    ("hitec city", "Hitec City"),
    ("hitech city", "Hitec City"),
    ("హైటెక్ సిటీ", "హైటెక్ సిటీ"),
    ("gachibowli", "Gachibowli"),
    ("గచ్చిబౌలి", "గచ్చిబౌలి"),
    ("गच्चीबौली", "गच्चीबौली"),
    ("ameerpet", "Ameerpet"),
    ("అమీర్‌పేట్", "అమీర్‌పేట్"),
    ("అమీర్ పేట్", "అమీర్‌పేట్"),
    ("अमीरपेट", "अमीरपेट"),
    ("charminar", "Charminar"),
    ("చార్మినార్", "చార్మినార్"),
    ("चारमीनार", "चारमीनार"),
    ("laad bazaar", "Laad Bazaar"),
    ("लाड बाज़ार", "लाड बाज़ार"),
    ("लाड बाजार", "लाड बाज़ार"),
    ("begumpet", "Begumpet"),
    ("బేగంపేట్", "బేగంపేట్"),
    ("dilsukhnagar", "Dilsukhnagar"),
    ("దిల్‌సుఖ్‌నగర్", "దిల్‌సుఖ్‌నగర్"),
    ("lb nagar", "LB Nagar"),
    ("ఎల్బీ నగర్", "ఎల్బీ నగర్"),
    ("miyapur", "Miyapur"),
    ("మియాపూర్", "మియాపూర్"),
    ("kondapur", "Kondapur"),
    ("కొండాపూర్", "కొండాపూర్"),
    ("mehdipatnam", "Mehdipatnam"),
    ("మెహదీపట్నం", "మెహదీపట్నం"),
    ("tolichowki", "Tolichowki"),
    ("uppal", "Uppal"),
    ("ఉప్పల్", "ఉప్పల్"),
    ("tarnaka", "Tarnaka"),
    ("malkajgiri", "Malkajgiri"),
    ("abids", "Abids"),
    ("koti", "Koti"),
    ("nampally", "Nampally"),
    ("himayatnagar", "Himayatnagar"),
    ("somajiguda", "Somajiguda"),
    ("punjagutta", "Punjagutta"),
    ("sr nagar", "SR Nagar"),
    ("manikonda", "Manikonda"),
    ("మణికొండ", "మణికొండ"),
    ("attapur", "Attapur"),
    ("bowenpally", "Bowenpally"),
    ("alwal", "Alwal"),
    ("kompally", "Kompally"),
    ("sainikpuri", "Sainikpuri"),
    ("benz circle", "Benz Circle"),
    ("patamata", "Patamata"),
    ("governorpet", "Governorpet"),
    ("bhavanipuram", "Bhavanipuram"),
]

NON_NAME_WORDS = {
    "writing", "complaining", "suffering", "facing", "living", "residing",
    "calling", "speaking", "reporting", "submitting", "requesting", "very",
    "deeply", "here", "there", "from", "since", "near", "opposite", "beside",
    "resident", "citizen", "villager", "student", "worried", "concerned",
    "troubled", "unable", "getting", "having", "a", "an", "the", "not",
    "provided", "unknown", "anonymous", "none", "null", "missing", "empty",
}

# Generic non-specific location phrases that must NEVER be treated as actual named streets, areas, or landmarks
GENERIC_LOCATION_PHRASES = {
    "our street",
    "my street",
    "this street",
    "that street",
    "the street",
    "street",
    "our area",
    "my area",
    "this area",
    "the area",
    "area",
    "our colony",
    "my colony",
    "this colony",
    "the colony",
    "colony",
    "our village",
    "my village",
    "this village",
    "the village",
    "village",
    "main road",
    "the main road",
    "our main road",
    "on the road",
    "the road",
    "this road",
    "damaged road",
    "broken road",
    "bad road",
    "road",
    "supply and the main road",
    "water supply and the main road",
    "no water supply and the main road",
    "nearby place",
    "near our house",
    "near my house",
    "our locality",
    "residential area",
    "మా వీధి",
    "మా ప్రాంతం",
    "మా కాలనీ",
    "ఈ వీధి",
    "మెయిన్ రోడ్",
    "हमारे इलाके",
    "हमारी गली",
    "हमारा एरिया",
    "मुख्य सड़क",
    "मेन रोड",
    "humare area",
    "hamare area",
    "maa area",
    "maa veedhi",
}


def is_generic_location_phrase(value: Optional[str]) -> bool:
    """Return True if a candidate location string is generic and not a real place name."""
    if not value or not value.strip():
        return True
    cleaned = re.sub(r"\s+", " ", value.strip().lower()).strip(".,;:-")
    if cleaned in GENERIC_LOCATION_PHRASES:
        return True
    # Reject strings that start with possessive/demonstrative determiners followed by generic nouns
    if re.match(
        r"^(?:in\s+)?(?:our|my|this|that|the|every|whole|entire)\s+(?:street|road|main\s+road|area|colony|locality|village|town|city|ward|lane|place|house|home)s?$",
        cleaned,
    ):
        return True
    # Reject accidental clause captures containing verbs or conjunctions like "supply and the main road"
    if any(
        bad_tok in cleaned.split()
        for bad_tok in (
            "supply",
            "water",
            "electricity",
            "garbage",
            "drainage",
            "problem",
            "issue",
            "is",
            "are",
            "has",
            "have",
            "been",
            "without",
            "there",
            "nobody",
        )
    ):
        return True
    return False


class InformationExtractor:
    """Extracts structured entities strictly grounded in the complaint text."""

    @staticmethod
    def extract_citizen_name(text: str) -> Optional[str]:
        if not text:
            return None

        # Reject explicit non-provision statements: "My name is not provided"
        if re.search(
            r"\bname\s+is\s+(?:not\s+provided|not\s+given|unknown|anonymous|optional)\b",
            text,
            flags=re.IGNORECASE,
        ):
            return None

        # 1. Telugu explicit name patterns: "నా పేరు రమేష్" / "నా పేరు శ్రీనివాస్ రావు"
        te_match = re.search(
            r"నా\s+పేరు\s+([^\.,|;\n]{2,35}?)(?:\s+అండి|\s+గారు|\s+మరియు|[\.,|;\n]|$)",
            text,
        )
        if te_match:
            candidate = te_match.group(1).strip()
            if candidate and "తెలియదు" not in candidate and "లేదు" not in candidate:
                return candidate

        # 2. Hindi explicit name patterns: "मेरा नाम राजेश शर्मा है"
        hi_match = re.search(
            r"मेरा\s+नाम\s+([^\.,|;\n]{2,35}?)(?:\s+है|\s+हूँ|\s+हूं|[\.,|;\n]|$)",
            text,
        )
        if hi_match:
            candidate = hi_match.group(1).strip()
            if candidate and "नहीं" not in candidate:
                return candidate

        # 3. Hinglish / Telugu-English explicit name patterns: "mera naam Rahul Verma hai", "naa peru Venkat Rao"
        rom_match = re.search(
            r"\b(?:mera\s+naam|naa?\s+peru)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+){0,2}?)(?=\s*(?:,|\.|\bhai\b|\bandi\b|\band\b|\bi\b|\bwe\b|\bin\b|\bfrom\b|\blive\b|\bliving\b|\bhamare\b|\bmaa\b|\bwater\b|\broad\b|\bgarbage\b|\belectric|\bdrain|\bstreet|\bmobile\b|$))",
            text,
            flags=re.IGNORECASE,
        )
        if rom_match:
            candidate = rom_match.group(1).strip()
            words = [w.lower() for w in candidate.split()]
            if words and not any(w in NON_NAME_WORDS for w in words):
                return " ".join(w.capitalize() for w in candidate.split())

        # 4. English explicit name patterns (supports both capitalized and lowercase unpunctuated speech-to-text)
        en_match = re.search(
            r"\b(?:my\s+name\s+is|i\s+am|this\s+is)\s+([a-zA-Z]{2,20}(?:\s+[a-zA-Z]{2,20}){0,2}?)(?=\s*(?:,|\.|\band\b|\bi\b|\bwe\b|\bin\b|\bat\b|\bfrom\b|\blive\b|\bliving\b|\bresiding\b|\bresident\b|\bstaying\b|\bcalling\b|\bspeaking\b|\breporting\b|\bcomplaining\b|\bpresident\b|\bsecretary\b|\bmy\b|\bour\b|\bthere\b|\bmobile\b|\bphone\b|\bcontact\b|\bwater\b|\broad\b|\bgarbage\b|\belectric|\bdrain|\bstreet|$))",
            text,
            flags=re.IGNORECASE,
        )
        if en_match:
            candidate = en_match.group(1).strip()
            words = [w.lower() for w in candidate.split()]
            if words and not any(w in NON_NAME_WORDS for w in words):
                return " ".join(w.capitalize() for w in candidate.split())

        return None

    @staticmethod
    def extract_contact_number(text: str) -> Optional[str]:
        if not text:
            return None
        mobile_match = re.search(
            r"(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b",
            text,
        )
        if mobile_match:
            return mobile_match.group(0).strip()
        return None

    @staticmethod
    def extract_email(text: str) -> Optional[str]:
        if not text:
            return None
        email_match = re.search(
            r"\b[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\b",
            text,
        )
        if email_match:
            return email_match.group(0).strip()
        return None

    @staticmethod
    def extract_designation(text: str) -> Optional[str]:
        if not text:
            return None
        patterns = [
            r"\b(RWA\s+(?:President|Secretary|Member|Treasurer))\b",
            r"\b(Resident\s+Welfare\s+Association\s+(?:President|Secretary|Member))\b",
            r"\b(Colony\s+(?:President|Secretary))\b",
            r"\b(Ward\s+Member|Sarpanch|School\s+Principal|Headmaster|Shopkeeper|Social\s+Worker)\b",
            r"(సర్పంచ్|వార్డు\s+మెంబర్|కాలనీ\s+అధ్యక్షుడు|ప్రధానోపాధ్యాయులు)",
            r"(पार्षद|सरपंच|सोसाइटी\s+अध्यक्ष|प्रधानाचार्य)",
        ]
        for pat in patterns:
            m = re.search(pat, text, flags=re.IGNORECASE)
            if m:
                return m.group(1).strip()
        return None

    @classmethod
    def extract_location(cls, text: str) -> ExtractedLocationData:
        loc = ExtractedLocationData()
        if not text or not text.strip():
            return loc

        lower_text = text.lower()

        # 1. District (check explicit "X district" first so "Nalgonda district" sets district="Nalgonda", not city="Nalgonda")
        dist_explicit_match = re.search(
            r"\b([A-Z][a-zA-Z\-]+)\s+District\b|([^\s,\.]+)\s+జిల్లా|([^\s,\.]+)\s+जिला",
            text,
            flags=re.IGNORECASE,
        )
        if dist_explicit_match:
            raw_dist = (
                dist_explicit_match.group(1)
                or dist_explicit_match.group(2)
                or dist_explicit_match.group(3)
            ).strip()
            if not is_generic_location_phrase(raw_dist):
                loc.district = raw_dist[0].upper() + raw_dist[1:] if raw_dist.isascii() else raw_dist

        if not loc.district:
            for token, canonical_dist in KNOWN_DISTRICTS:
                if f"{token} district" in lower_text:
                    loc.district = canonical_dist
                    break

        # 2. Village (explicit "<Name> village" / "<Name> గ్రామం" / "<Name> गांव")
        village_match = re.search(
            r"\b([A-Za-z][a-zA-Z]+)\s+village\b|([^\s,\.]+)\s+గ్రామం|ग्राम\s+([^\s,\.]+)|([^\s,\.]+)\s+(?:गाँव|गांव)",
            text,
            flags=re.IGNORECASE,
        )
        if village_match:
            raw_v = next((g for g in village_match.groups() if g), None)
            if raw_v and raw_v.lower() not in ("our", "this", "the", "my", "in", "a", "near", "from"):
                clean_v = raw_v.strip()
                loc.village = clean_v[0].upper() + clean_v[1:] if clean_v.isascii() else clean_v

        # 3. Mandal / Tehsil
        mandal_match = re.search(
            r"\b([A-Za-z][a-zA-Z]+)\s+(?:Mandal|Tahsil|Tehsil)\b|([^\s,\.]+)\s+మండలం|([^\s,\.]+)\s+(?:मंडल|तहसील)",
            text,
            flags=re.IGNORECASE,
        )
        if mandal_match:
            raw_m = next((g for g in mandal_match.groups() if g), None)
            if raw_m and raw_m.lower() not in ("our", "this", "the", "my", "in"):
                clean_m = raw_m.strip()
                loc.mandal = clean_m[0].upper() + clean_m[1:] if clean_m.isascii() else clean_m

        # 4. Town
        town_match = re.search(
            r"\b([A-Za-z][a-zA-Z]+)\s+town\b|([^\s,\.]+)\s+పట్టణం",
            text,
            flags=re.IGNORECASE,
        )
        if town_match:
            raw_t = next((g for g in town_match.groups() if g), None)
            if raw_t and raw_t.lower() not in ("our", "this", "the", "my", "in"):
                clean_t = raw_t.strip()
                loc.town = clean_t[0].upper() + clean_t[1:] if clean_t.isascii() else clean_t

        # 5. City (Gazetteer + contextual "resident of <City>" / "i live in <City>" / "in <City> city")
        for token, canonical_city in KNOWN_CITIES:
            if token in lower_text or token in text:
                # Don't duplicate into city if it was only mentioned as "<Name> district"
                if loc.district and loc.district.lower() == canonical_city.lower() and f"{token} district" in lower_text:
                    continue
                loc.city = canonical_city
                break

        if not loc.city and not loc.village:
            res_match = re.search(
                r"\b(?:resident\s+of|living\s+in|residing\s+in|citizen\s+of|i\s+live\s+in|we\s+live\s+in|i\s+stay\s+in)\s+([a-zA-Z]{3,25})(?=\s*(?:,|\.|\bnear\b|\bopposite\b|\bthere\b|\bwhere\b|\band\b|\bin\b|\bwater\b|\broad\b|\bgarbage\b|\belectric|\bdrain|\bstreet|\bsince\b|\bfor\b|$))",
                text,
                flags=re.IGNORECASE,
            )
            if res_match:
                cand_city = res_match.group(1).strip()
                if not is_generic_location_phrase(cand_city) and cand_city.lower() not in ("our", "this", "the", "my", "here"):
                    loc.city = cand_city.capitalize()

        # 6. Ward Number
        ward_match = re.search(
            r"\b(Ward\s*(?:No\.?|Number)?\s*\d+[A-Za-z]?)\b|(వార్డు\s*(?:నంబర్)?\s*\d+)|(वार्ड\s*(?:नंबर|संख्या)?\s*\d+)",
            text,
            flags=re.IGNORECASE,
        )
        if ward_match:
            loc.ward = next((g.strip() for g in ward_match.groups() if g), None)

        # 7. PIN Code (6-digit Indian PIN code starting with 1-8, not part of a 10-digit phone number)
        pin_match = re.search(r"(?<!\d)([1-8]\d{5})(?!\d)", text)
        if pin_match:
            loc.pincode = pin_match.group(1).strip()

        # 8. Area / Locality
        for token, canonical_area in KNOWN_AREAS:
            if token in lower_text or token in text:
                loc.area = canonical_area
                break

        if not loc.area:
            colony_match = re.search(
                r"\b([a-zA-Z]{2,20}(?:\s+[a-zA-Z0-9]{1,20}){0,2}\s+(?:Colony|Nagar|Basti|Enclave|Layout|Phase\s+\d+|Sector\s+\d+|Hills|Gardens|Extension|Vihar|Puram|Peta|Guda))\b",
                text,
                flags=re.IGNORECASE,
            )
            if colony_match:
                candidate_area = colony_match.group(1).strip()
                # Strip leading prepositions if captured
                candidate_area = re.sub(r"^(?:in|at|from|near|of)\s+", "", candidate_area, flags=re.IGNORECASE).strip()
                if not is_generic_location_phrase(candidate_area):
                    loc.area = " ".join(w.capitalize() if w.isascii() else w for w in candidate_area.split())

        # 9. Street / Road (strictly filtered against generic phrases like "our street" or "supply and the main road")
        street_patterns = [
            (r"\b((?:Road|Street|Lane|Gali)\s*(?:No\.?|Number)\s*\d+[A-Za-z]?)\b", re.IGNORECASE),
            (r"\b([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+){0,1}\s+(?:Main\s+Road|Road|Street|Marg|Cross\s+Roads))\b", 0),
            (r"\b(?:in|at|on|along)\s+([a-zA-Z]{3,20}\s+(?:Main\s+Road|Road|Street|Marg|Lane))\b", re.IGNORECASE),
            (r"(రోడ్\s*నంబర్\s*\d+)", 0),
            (r"(रोड\s*नंबर\s*\d+|गली\s*नंबर\s*\d+)", 0),
        ]
        for pat, flg in street_patterns:
            sm = re.search(pat, text, flags=flg)
            if sm:
                candidate_st = sm.group(1).strip()
                if not is_generic_location_phrase(candidate_st):
                    loc.street = " ".join(w.capitalize() if w.isascii() else w for w in candidate_st.split())
                    break

        # 10. House / Plot / Flat Number
        house_match = re.search(
            r"\b((?:H\.?\s*No\.?|House\s*No\.?|Plot\s*(?:No\.?)?|Flat\s*(?:No\.?)?|Door\s*No\.?)\s*[#:\-]?\s*[A-Za-z0-9\-\/]+)\b"
            r"|((?:ఇంటి\s*నంబర్|ప్లాట్\s*నంబర్)\s*[0-9\-\/]+)"
            r"|((?:मकान\s*नंबर|प्लॉट\s*नंबर)\s*[0-9\-\/]+)",
            text,
            flags=re.IGNORECASE,
        )
        if house_match:
            loc.house_number = next((g.strip() for g in house_match.groups() if g), None)

        # 11. Nearest Landmark
        landmark_val = cls._extract_landmark(text)
        if landmark_val and not is_generic_location_phrase(landmark_val):
            loc.landmark = landmark_val

        # 12. Check if trailing "| Location: ..." metadata was appended by UI
        if "| Location:" in text:
            loc_tail = text.split("| Location:", 1)[1].strip()
            if loc_tail:
                loc.additional_location_details = loc_tail

        return loc

    @staticmethod
    def _extract_landmark(text: str) -> Optional[str]:
        clean_text = text.split("| Location:")[0]

        # 1. Explicit "Landmark: XYZ"
        explicit_lm = re.search(
            r"\bLandmark\s*[:\-]\s*([^,\.;|\n]+)",
            text,
            flags=re.IGNORECASE,
        )
        if explicit_lm:
            cand = explicit_lm.group(1).strip()
            if not is_generic_location_phrase(cand):
                return cand

        # 2. English / Hinglish prepositional landmarks:
        # Supports both punctuated text and continuous unpunctuated speech-to-text
        en_lm = re.search(
            r"\b(near|opposite|beside|behind|in\s+front\s+of|next\s+to|adjacent\s+to)\s+((?:the\s+)?[A-Za-z0-9][A-Za-z0-9\s\-\.]{2,42}?)(?=\s*(?:,|\.|\bwhere\b|\bcausing\b|\band\b|\bsince\b|\bfor\b|\bis\b|\bare\b|\bwas\b|\bwere\b|\bhave\b|\bhas\b|\bin\b|\bfrom\b|\bthere\b|\bwater\b|\bno\s+water\b|\bno\s+drinking\b|\broad\b|\bpothole|\bgarbage\b|\btrash\b|\belectric|\bpower\b|\bcurrent\b|\bstreet\s*light|\bdrain|\bsewage\b|\bproblem\b|\bissue\b|\boverflow|$))",
            clean_text,
            flags=re.IGNORECASE,
        )
        if en_lm:
            prep = en_lm.group(1).strip()
            place = en_lm.group(2).strip()
            if not is_generic_location_phrase(place) and not re.match(
                r"^(?:our|my|the|this)\s+(?:house|home|area|colony|street|village|road|place)$",
                place.lower(),
            ):
                return f"{prep.capitalize()} {place}"

        # 3. Telugu postpositional landmarks: "అమీర్‌పేట్ మెట్రో స్టేషన్ దగ్గర", "కమ్యూనిటీ హాల్ దగ్గర", "ప్రభుత్వ పాఠశాల దగ్గర"
        te_lm = re.search(
            r"([^\.,;|\n]{3,40}?)\s+(దగ్గర|సమీపంలో|ఎదురుగా|పక్కన)",
            clean_text,
        )
        if te_lm:
            phrase = f"{te_lm.group(1).strip()} {te_lm.group(2).strip()}"
            words = phrase.split()
            if len(words) > 5:
                phrase = " ".join(words[-5:])
            return phrase

        # 4. Hindi / Hinglish postpositional landmarks: "हनुमान मंदिर के पास", "सरकारी स्कूल के पास"
        hi_lm = re.search(
            r"([^\.,;|\n]{3,40}?)\s+(के\s+पास|के\s+सामने|के\s+बगल\s+में|के\s+पीछे|ke\s+paas|ke\s+samne|daggara)",
            clean_text,
            flags=re.IGNORECASE,
        )
        if hi_lm:
            phrase = f"{hi_lm.group(1).strip()} {hi_lm.group(2).strip()}"
            words = phrase.split()
            if len(words) > 5:
                phrase = " ".join(words[-5:])
            return phrase

        return None

    @staticmethod
    def extract_duration_and_date(text: str) -> Tuple[Optional[str], Optional[str]]:
        if not text:
            return None, None

        duration: Optional[str] = None
        incident_date: Optional[str] = None

        # --- Duration extraction ---
        dur_patterns = [
            # Telugu: "గత మూడు రోజులుగా", "గత వారం రోజులుగా", "వారం రోజులుగా", "4 రోజుల నుండి", "రెండు వారాలుగా"
            r"((?:గత\s+)?(?:\d+|ఒక|రెండు|మూడు|నాలుగు|ఐదు|ఆరు|ఏడు|పది|కొన్ని|చాలా|వారం|నెల)\s*(?:రోజులుగా|రోజుల\s*నుండి|వారాలుగా|వారాల\s*నుండి|నెలలుగా|గంటలుగా|గంటల\s*నుండి))",
            r"((?:గత\s+)?(?:వారం|రెండు\s*వారాలు|నెల)\s*(?:నుండి|రోజులుగా))",
            # Hindi: "पिछले चार दिनों से", "तीन दिनों से", "पिछले एक सप्ताह से", "5 दिन से"
            r"((?:पिछले\s+)?(?:\d+|एक|दो|तीन|चार|पांच|पाँच|छह|सात|दस|कई|एक\s+सप्ताह|एक\s+हफ्ते)\s*(?:दिनों\s*से|दिन\s*से|हफ्तों\s*से|सप्ताह\s*से|महीनों\s*से|घंटों\s*से|से))",
            # Hinglish / Telugu-English: "pichle 4 dinon se", "4 din se", "gata 4 rojuluga", "2 weeks nundi"
            r"\b((?:pichle|pichhle|gata|last|past)?\s*(?:\d+|two|three|four|five|six|seven|ten|teen|char|do|moodu|nalugu|oka|ek)\s*(?:dinon\s*se|dino\s*se|din\s*se|rojuluga|rojula\s*nundi|rojulu\s*nundi|ghante\s*se|hours\s*nundi|weeks\s*se|hafton\s*se))\b",
            # English: "for the past 3 days", "for four days", "for two days", "from 4 days", "since yesterday evening"
            r"\b((?:for\s+the\s+(?:past|last)|for|from|since\s+the\s+(?:past|last)|since|over)\s+(?:\d+|a|an|one|two|three|four|five|six|seven|eight|ten|several|many|few)\s+(?:days?|weeks?|months?|hours?|nights?))\b",
            r"\b(since\s+yesterday\s+(?:evening|morning|night|afternoon)|since\s+last\s+night)\b",
        ]
        for pat in dur_patterns:
            m = re.search(pat, text, flags=re.IGNORECASE)
            if m:
                duration = m.group(1).strip()
                break

        # --- Incident date extraction ---
        date_patterns = [
            # Explicit calendar dates: "28 October 2026", "October 28, 2026", "15th August", "2026-10-28", "28/10/2026"
            r"\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s*,?\s*\d{4})?)\b",
            r"\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)\b",
            r"\b(\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b",
            # Relative day/time anchors in English, Telugu, Hindi, Hinglish
            r"\b((?:since\s+|on\s+)?(?:yesterday|last\s+night|today\s+morning|yesterday\s+evening|yesterday\s+night|monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+(?:morning|evening|night|afternoon))?)\b",
            r"(నిన్న\s+రాత్రి|నిన్న\s+ఉదయం|నిన్న\s+సాయంత్రం|నిన్నటి\s+నుండి|ఈరోజు\s+ఉదయం|ఆదివారం|సోమవారం|మంగళవారం|బుధవారం|గురువారం|శుక్రవారం|శనివారం)",
            r"(कल\s+रात|कल\s+सुबह|कल\s+शाम|आज\s+सुबह|सोमवार|मंगलवार|बुधवार|गुरुवार|शुक्रवार|शनिवार|रविवार)",
            r"\b(kal\s+raat|kal\s+subah|kal\s+shaam|aaj\s+subah|ninna\s+raatri|ninna\s+udayam)\b",
        ]
        for pat in date_patterns:
            dm = re.search(pat, text, flags=re.IGNORECASE)
            if dm:
                incident_date = dm.group(1).strip()
                break

        return duration, incident_date

    @staticmethod
    def extract_affected_people(text: str) -> Optional[str]:
        if not text:
            return None
        patterns = [
            r"\b((?:around|approximately|about|nearly|over)?\s*\d+\+?\s*(?:families|households|residents|houses|people|citizens|students|children|patients|passengers|villagers))\b",
            r"\b((?:many\s+houses|many\s+families|several\s+families|elderly\s+(?:people|residents|citizens)|senior\s+citizens|women\s+and\s+children|school\s+children|pedestrians|two-wheeler\s+riders|commuters|entire\s+(?:colony|street|village|locality|apartments))(?:\s+and\s+[a-z\s]+)?)\b",
            r"((?:సుమారు\s+|దాదాపు\s+)?\d+\s*కుటుంబాలు|కాలనీ\s+ప్రజలు|వృద్ధులు\s+మరియు\s+మహిళలు|చిన్న\s+పిల్లలు|పాఠశాల\s+విద్యార్థులు|వాహనదారులు)",
            r"((?:लगभग\s+|करीब\s+)?\d+\s*परिवार|बुजुर्गों\s+और\s+महिलाओं|स्कूली\s+बच्चों|मोहल्ले\s+के\s+लोग|पूरी\s+कॉलोनी|राहगीरों)",
        ]
        for pat in patterns:
            m = re.search(pat, text, flags=re.IGNORECASE)
            if m:
                return m.group(1).strip()
        return None

    @staticmethod
    def compute_missing_mandatory_fields(
        citizen_name: Optional[str],
        location: ExtractedLocationData,
        department_category: Optional[str],
        needs_clarification: bool,
        is_valid_grievance: bool = True,
    ) -> List[str]:
        """
        Evaluates strictly the 5 mandatory registration fields from Section 7:
        1. Full name
        2. Village / Town / City
        3. Area / Street
        4. Nearby landmark
        5. Complaint description / specific issue
        Never blocks registration on optional fields (mobile, email, duration, date, affected_people).
        """
        missing: List[str] = []
        if not is_valid_grievance:
            missing.append("specific_grievance_details")
            return missing

        if not citizen_name or not citizen_name.strip():
            missing.append("citizen_name")
        if not location.has_settlement():
            missing.append("village_or_city")
        if not location.has_locality_or_street() and not bool(location.landmark):
            missing.append("area_or_street")
        if not location.landmark:
            missing.append("nearest_landmark")
        if not department_category:
            missing.append("specific_grievance_details")
        return missing

    @staticmethod
    def compute_missing_information(
        location: ExtractedLocationData,
        problem_duration: Optional[str],
        department_category: Optional[str],
        needs_clarification: bool,
        citizen_name: Optional[str] = None,
    ) -> List[str]:
        """
        Preserves backward-compatible missing_information list for existing unit tests
        while accurately flagging missing location, landmark, citizen_name, and specific details.
        """
        missing: List[str] = []
        if not location.has_any_primary_location():
            missing.append("location (area, colony, street, or village)")
        else:
            if not location.has_settlement():
                missing.append("location (village, town, or city)")
            if not location.has_locality_or_street():
                missing.append("location (area, colony, or street)")
        if not location.landmark:
            missing.append("nearest_landmark")
        if not citizen_name:
            missing.append("citizen_name")
        if needs_clarification or not department_category:
            missing.append("specific_grievance_details")
        return missing


information_extractor = InformationExtractor()
