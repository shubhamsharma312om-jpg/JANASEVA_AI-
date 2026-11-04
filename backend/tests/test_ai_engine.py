"""
JANASEVA AI — Unit Tests for the Intelligent Grievance Understanding Engine
Tests all 10 required scenarios from Section 12:
1. Telugu water complaint.
2. Hindi garbage complaint.
3. English pothole complaint.
4. Hinglish electricity complaint.
5. Telugu-English code-mixed complaint.
6. Complaint containing a person's name and landmark.
7. Complaint containing duration and incident date.
8. Complaint with no location information.
9. Ambiguous complaint that requires clarification.
10. Complaint with multiple issues.
Plus anti-hallucination and department_mapping.json validation checks.
"""

import sys
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.ai_engine.pipeline import grievance_ai_pipeline
from app.ai_engine.validator import grievance_validator


class TestIntelligentGrievanceEngine(unittest.TestCase):
    def test_01_telugu_water_complaint(self) -> None:
        text = "మా కాలనీలో గత మూడు రోజులుగా మంచినీటి సరఫరా లేదు. కుకట్‌పల్లి ఫేజ్ 3 వాటర్ పైప్‌లైన్ లీకేజీ వల్ల తీవ్ర ఇబ్బంది పడుతున్నాము."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["original_transcript"], text)
        self.assertEqual(result["detected_language"], "te")
        self.assertEqual(result["department_category"], "Water Supply")
        self.assertEqual(result["department_name"], "Water Supply Department")
        self.assertEqual(result["department_id"], "DEPT-WATER-01")
        self.assertEqual(result["location"]["area"], "కుకట్‌పల్లి ఫేజ్ 3")
        self.assertIsNotNone(result["problem_duration"])
        self.assertIsNone(result["citizen_name"])
        self.assertIsNone(result["contact_number"])
        self.assertIsNone(result["email"])
        self.assertIn("Water Supply Department", result["enhanced_complaint"])
        self.assertIn("మంచినీటి", result["enhanced_complaint"])

    def test_02_hindi_garbage_complaint(self) -> None:
        text = "बंजारा हिल्स रोड नंबर 12 के सामुदायिक कूड़ेदान से तीन दिनों से कचरा नहीं उठाया गया है, जिससे दुर्गंध और मच्छर बढ़ रहे हैं।"
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["detected_language"], "hi")
        self.assertEqual(result["department_category"], "Garbage Collection")
        self.assertEqual(result["department_name"], "Sanitation Department")
        self.assertEqual(result["department_id"], "DEPT-SANI-03")
        self.assertEqual(result["location"]["area"], "बंजारा हिल्स")
        self.assertIsNotNone(result["problem_duration"])
        self.assertIsNone(result["citizen_name"])
        self.assertIsNone(result["contact_number"])
        self.assertIn("Sanitation Department", result["enhanced_complaint"])

    def test_03_english_pothole_complaint(self) -> None:
        text = "Deep potholes on Madhapur Main Road near Metro Pillar 1728 are causing two-wheeler accidents in Hyderabad."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["detected_language"], "en")
        self.assertEqual(result["department_category"], "Roads and Potholes")
        self.assertEqual(result["department_name"], "Municipal Engineering")
        self.assertEqual(result["department_id"], "DEPT-MUNI-02")
        self.assertEqual(result["location"]["city"], "Hyderabad")
        self.assertEqual(result["location"]["area"], "Madhapur")
        self.assertIn("Metro Pillar 1728", result["location"]["landmark"] or "")
        self.assertIn(result["priority"], ("high", "critical"))
        self.assertIsNone(result["citizen_name"])

    def test_04_hinglish_electricity_complaint(self) -> None:
        text = "Ameerpet mein pichle 2 dinon se bijli nahi aa rahi hai aur transformer se spark aa raha hai, log bahut pareshan hain."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["detected_language"], "hi-en")
        self.assertEqual(result["department_category"], "Electricity")
        self.assertEqual(result["department_name"], "Electricity Department")
        self.assertEqual(result["department_id"], "DEPT-ELEC-04")
        self.assertEqual(result["location"]["area"], "Ameerpet")
        self.assertEqual(result["priority"], "critical")
        self.assertIsNotNone(result["problem_duration"])
        self.assertIsNone(result["citizen_name"])
        self.assertIsNone(result["contact_number"])

    def test_05_telugu_english_codemixed_complaint(self) -> None:
        text = "Miyapur lo gata 4 rojuluga street light pani cheyatledu, raatri poota chala cheekatiga undi."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["detected_language"], "te-en")
        self.assertEqual(result["department_category"], "Streetlights")
        self.assertEqual(result["department_name"], "Electrical Maintenance")
        self.assertEqual(result["department_id"], "DEPT-ELMT-05")
        self.assertEqual(result["location"]["area"], "Miyapur")
        self.assertIsNotNone(result["problem_duration"])
        self.assertIsNone(result["citizen_name"])

    def test_06_complaint_with_person_name_and_landmark(self) -> None:
        text = "My name is Ramesh Kumar, RWA President. There is an open manhole overflowing with sewage near Hanuman Temple in Begumpet. My phone is 9848011223."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["citizen_name"], "Ramesh Kumar")
        self.assertEqual(result["designation"], "RWA President")
        self.assertEqual(result["contact_number"], "9848011223")
        self.assertEqual(result["location"]["area"], "Begumpet")
        self.assertIn("Hanuman Temple", result["location"]["landmark"] or "")
        self.assertEqual(result["department_category"], "Drainage")
        self.assertEqual(result["department_id"], "DEPT-DRNG-06")
        self.assertEqual(result["priority"], "critical")
        self.assertIn("Ramesh Kumar", result["enhanced_complaint"])
        self.assertIn("Hanuman Temple", result["enhanced_complaint"])

    def test_07_complaint_with_duration_and_incident_date(self) -> None:
        text = "Since 28 October 2026, a large fallen tree branch has been blocking the footpath for the past 5 days in Jubilee Hills."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["department_category"], "Public Safety")
        self.assertEqual(result["department_id"], "DEPT-SAFE-07")
        self.assertIn("5 days", result["problem_duration"] or "")
        self.assertEqual(result["incident_date"], "28 October 2026")
        self.assertEqual(result["location"]["area"], "Jubilee Hills")
        self.assertIn("28 October 2026", result["enhanced_complaint"])
        self.assertIn("5 days", result["enhanced_complaint"])

    def test_08_complaint_with_no_location_information(self) -> None:
        text = "The drinking water tap is completely dry and no water supply is coming at all."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["department_category"], "Water Supply")
        self.assertIsNone(result["location"]["village"])
        self.assertIsNone(result["location"]["city"])
        self.assertIsNone(result["location"]["district"])
        self.assertIsNone(result["location"]["area"])
        self.assertIsNone(result["location"]["street"])
        self.assertIsNone(result["location"]["house_number"])
        self.assertIsNone(result["location"]["landmark"])
        self.assertTrue(
            any("location" in item for item in result["missing_information"])
        )

    def test_09_ambiguous_complaint_requiring_clarification(self) -> None:
        text = "There is a big problem in our area and people are facing severe inconvenience. Please send an officer immediately."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertTrue(result["needs_clarification"])
        self.assertIsNotNone(result["clarification_question"])
        self.assertLess(result["confidence_score"], 0.5)

    def test_10_complaint_with_multiple_issues(self) -> None:
        text = "In Dilsukhnagar Main Road, there are deep potholes on the road and overflowing garbage dustbins that have not been cleared for 4 days."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertIn(
            result["department_category"],
            ("Roads and Potholes", "Garbage Collection"),
        )
        self.assertTrue(len(result["secondary_categories"]) >= 1)
        self.assertIsNotNone(result["clarification_question"])
        self.assertIn("Dilsukhnagar", result["enhanced_complaint"])

    def test_11_validator_rejects_invalid_department_and_hallucinated_contact(self) -> None:
        transcript = "Water pipeline is leaking in Kondapur."
        raw = {
            "original_transcript": transcript,
            "detected_language": "en",
            "citizen_name": None,
            "contact_number": "9999988888",  # Hallucinated — not in transcript!
            "email": "fake@example.com",     # Hallucinated — not in transcript!
            "designation": None,
            "problem_summary": "Water pipeline leak in Kondapur",
            "problem_description": transcript,
            "location": {"area": "Kondapur"},
            "department_category": "Fake Nonexistent Category",
            "department_name": "Fake Department",
            "department_id": "DEPT-FAKE-99",
            "priority": "normal",
            "priority_reason": "Standard leak",
            "missing_information": [],
            "needs_clarification": False,
            "clarification_question": None,
            "enhanced_complaint": "Formal complaint regarding water pipeline leak in Kondapur.",
        }
        validated = grievance_validator.validate_and_sanitize(raw, transcript)
        self.assertIsNone(validated["contact_number"])
        self.assertIsNone(validated["email"])
        self.assertEqual(validated["department_id"], "DEPT-SAFE-07")

    # =========================================================================
    # PHASE 5 MANDATORY INTELLIGENCE TESTS (TESTS 1 THROUGH 15)
    # =========================================================================

    def test_12_phase5_english_vijayawada_water_grievance(self) -> None:
        text = "I am a resident of Vijayawada. Water has not been supplied in our area for four days. Around 30 families are affected."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "CIVIC_GRIEVANCE")
        self.assertTrue(result["is_valid_grievance"])
        self.assertEqual(result["department_category"], "Water Supply")
        self.assertEqual(result["department_id"], "DEPT-WATER-01")
        self.assertEqual(result["location"]["city"], "Vijayawada")
        self.assertIsNone(result["location"]["street"])
        self.assertIsNone(result["location"]["landmark"])
        self.assertIn("four days", (result["problem_duration"] or "").lower())
        self.assertIn("30 families", (result["affected_people"] or "").lower())

    def test_13_phase5_telugu_water_grievance(self) -> None:
        text = "మా ప్రాంతంలో గత నాలుగు రోజులుగా నీటి సరఫరా లేదు. సుమారు 30 కుటుంబాలు ఇబ్బంది పడుతున్నాయి."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "CIVIC_GRIEVANCE")
        self.assertEqual(result["detected_language"], "te")
        self.assertEqual(result["department_category"], "Water Supply")
        self.assertEqual(result["department_id"], "DEPT-WATER-01")
        self.assertIn("నాలుగు రోజులుగా", result["problem_duration"] or "")
        self.assertIn("30 కుటుంబాలు", result["affected_people"] or "")
        self.assertTrue(len(result["enhanced_complaint"]) > 20)

    def test_14_phase5_hindi_water_grievance(self) -> None:
        text = "हमारे इलाके में पिछले चार दिनों से पानी की सप्लाई नहीं हो रही है। लगभग 30 परिवार प्रभावित हैं।"
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "CIVIC_GRIEVANCE")
        self.assertEqual(result["detected_language"], "hi")
        self.assertEqual(result["department_category"], "Water Supply")
        self.assertEqual(result["department_id"], "DEPT-WATER-01")
        self.assertIn("चार दिनों", result["problem_duration"] or "")
        self.assertIn("30 परिवार", result["affected_people"] or "")
        self.assertTrue(len(result["enhanced_complaint"]) > 20)

    def test_15_phase5_hinglish_water_grievance(self) -> None:
        text = "Hamare area mein 4 din se water supply nahi aa rahi hai."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "CIVIC_GRIEVANCE")
        self.assertEqual(result["detected_language"], "hi-en")
        self.assertEqual(result["department_category"], "Water Supply")
        self.assertEqual(result["department_id"], "DEPT-WATER-01")
        self.assertIn("4 din se", (result["problem_duration"] or "").lower())

    def test_16_phase5_electricity_without_false_street(self) -> None:
        text = "Our street has been without electricity since yesterday evening."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "CIVIC_GRIEVANCE")
        self.assertEqual(result["department_category"], "Electricity")
        self.assertEqual(result["department_id"], "DEPT-ELEC-04")
        # "Our street" must NOT be extracted as an actual street name
        self.assertIsNone(result["location"]["street"])

    def test_17_phase5_telugu_garbage_week_duration(self) -> None:
        text = "చెత్తను గత వారం రోజులుగా ఎవరూ తీసుకెళ్లడం లేదు."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "CIVIC_GRIEVANCE")
        self.assertEqual(result["detected_language"], "te")
        self.assertEqual(result["department_category"], "Garbage Collection")
        self.assertEqual(result["department_id"], "DEPT-SANI-03")
        self.assertIsNotNone(result["problem_duration"])

    def test_18_phase5_multiple_grievances_water_and_potholes(self) -> None:
        text = "There is no water supply in our area and the main road is also full of potholes."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "CIVIC_GRIEVANCE")
        self.assertEqual(result["department_category"], "Water Supply")
        self.assertIn("Roads and Potholes", result["secondary_categories"])
        self.assertEqual(len(result["identified_issues"]), 2)
        self.assertIsNone(result["location"]["street"])

    def test_19_phase5_missing_location_drainage(self) -> None:
        text = "There is a drainage problem."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "CIVIC_GRIEVANCE")
        self.assertEqual(result["department_category"], "Drainage")
        self.assertIsNone(result["location"]["village"])
        self.assertIsNone(result["location"]["city"])
        self.assertIsNone(result["location"]["area"])
        self.assertIsNone(result["location"]["landmark"])
        self.assertTrue(result["needs_clarification"])
        self.assertIsNotNone(result["clarification_question"])

    def test_20_phase5_ambiguous_statement_no_department_guess(self) -> None:
        text = "Nobody is maintaining our area properly."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "AMBIGUOUS_REQUEST")
        self.assertFalse(result["is_valid_grievance"])
        self.assertIsNone(result["department_category"])
        self.assertTrue(result["needs_clarification"])
        self.assertIsNotNone(result["clarification_question"])
        self.assertEqual(result["enhanced_complaint"], "")

    def test_21_phase5_unrelated_weather_query_rejected(self) -> None:
        text = "What is the weather today?"
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "UNRELATED_QUERY")
        self.assertFalse(result["is_valid_grievance"])
        self.assertIsNone(result["department_category"])
        self.assertEqual(result["enhanced_complaint"], "")
        self.assertIsNotNone(result["clarification_question"])

    def test_22_phase5_greeting_rejected_politely(self) -> None:
        text = "Hello, how are you?"
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "GREETING")
        self.assertFalse(result["is_valid_grievance"])
        self.assertIsNone(result["department_category"])
        self.assertEqual(result["enhanced_complaint"], "")
        self.assertIsNotNone(result["clarification_question"])

    def test_23_phase5_false_urgency_streetlight_two_days(self) -> None:
        text = "The streetlight has not been working for two days."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["department_category"], "Streetlights")
        self.assertNotEqual(result["priority"], "critical")
        self.assertEqual(result["priority"], "normal")

    def test_24_phase5_immediate_danger_live_electric_wire(self) -> None:
        text = "There is a live electric wire lying on the road."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertEqual(result["intent_type"], "EMERGENCY_OR_IMMEDIATE_DANGER")
        self.assertTrue(result["is_valid_grievance"])
        self.assertEqual(result["department_category"], "Electricity")
        self.assertEqual(result["department_id"], "DEPT-ELEC-04")
        self.assertEqual(result["priority"], "critical")
        self.assertIsNotNone(result["safety_advisory"])

    def test_25_phase5_hallucination_prevention_name_not_provided(self) -> None:
        text = "My name is not provided. There is a road problem."
        result = grievance_ai_pipeline.analyze_grievance(text)
        self.assertIsNone(result["citizen_name"])
        self.assertIsNone(result["contact_number"])
        self.assertIsNone(result["location"]["city"])
        self.assertIsNone(result["location"]["street"])
        self.assertEqual(result["department_category"], "Roads and Potholes")
        self.assertIn("citizen_name", result["missing_mandatory_fields"])

    def test_26_phase5_clarification_memory_ramapuram_village(self) -> None:
        step1 = grievance_ai_pipeline.analyze_grievance("There is a drainage problem.")
        self.assertEqual(step1["department_category"], "Drainage")
        self.assertTrue(step1["needs_clarification"])

        step2 = grievance_ai_pipeline.analyze_grievance(
            transcript="Near the government school in Ramapuram village.",
            conversation_context={
                "original_transcript": step1["original_transcript"],
                "department_category": step1["department_category"],
                "location": step1["location"],
            },
        )
        self.assertEqual(step2["department_category"], "Drainage")
        self.assertEqual(step2["location"]["village"], "Ramapuram")
        self.assertIn("government school", (step2["location"]["landmark"] or "").lower())
        self.assertIn("Ramapuram", step2["clarification_question"] or "")


if __name__ == "__main__":
    unittest.main()

