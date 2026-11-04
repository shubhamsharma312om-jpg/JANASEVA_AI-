import React, { useEffect, useRef, useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  Loader2,
  MapPin,
  Sparkles,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  GrievanceAIAnalysisResult,
  GrievanceCategory,
  GrievanceRecord,
  LanguageCode,
  PriorityLevel,
} from '../../types/janaseva';
import {
  formatLanguageName,
  getPriorityColorClass,
} from '../../utils/formatters';
import { getVisualAssetForDepartmentOrCategory } from '../../utils/departmentAssets';
import { VoiceComplaintInput } from '../../components/citizen/VoiceComplaintInput';
import { ReadAloudButton } from '../../components/common/ReadAloudButton';
import { analyzeCitizenGrievance } from '../../services/aiGrievanceApi';

interface VoiceNavigationState {
  voiceTranscript?: string;
  detectedLanguage?: LanguageCode;
  autoAnalyze?: boolean;
}

function mapProvisionalToPriorityLevel(prov?: string): PriorityLevel {
  const clean = (prov || '').toLowerCase().trim();
  if (clean === 'critical') return 'CRITICAL';
  if (clean === 'high') return 'HIGH';
  if (clean === 'low') return 'LOW';
  return 'MEDIUM';
}

export const RegisterComplaintPage: React.FC = () => {
  const { user, submitComplaint } = useApp();
  const {
    t,
    translateCategory,
    translateDepartment,
    translatePriority,
  } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preselectedCategory = searchParams.get(
    'category'
  ) as GrievanceCategory | null;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Complaint Language (strictly separate from UI language!)
  const [language, setLanguage] = useState<LanguageCode>(
    user?.preferred_language || 'te'
  );

  // Section A — Citizen Information
  // Mandatory: Full Name
  // Optional: Mobile Number, Email Address, Existing Citizen Reference ID, Designation / Occupation
  const [citizenName, setCitizenName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [citizenReferenceId, setCitizenReferenceId] = useState(
    user?.id || ''
  );
  const [designation, setDesignation] = useState('');

  // Section B — Location Information (Rural & Urban Friendly)
  // Mandatory: Village / Town / City, Area / Street, Nearby Landmark
  // Optional: House Number, Mandal, District, State, PIN Code
  const [villageOrCity, setVillageOrCity] = useState('');
  const [areaOrStreet, setAreaOrStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [mandal, setMandal] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('Telangana');
  const [pinCode, setPinCode] = useState('');

  // Section C — Complaint Details
  // Mandatory: Complaint Description
  // Optional: Problem Duration, Incident Date, Approximate Number of People Affected, Attachment
  const [description, setDescription] = useState('');
  const [problemDuration, setProblemDuration] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [affectedPeople, setAffectedPeople] = useState('');
  const [attachmentName, setAttachmentName] = useState<string>('');

  // AI Grievance Understanding Engine States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] =
    useState<GrievanceAIAnalysisResult | null>(null);
  const [enhancedComplaintText, setEnhancedComplaintText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    GrievanceCategory | ''
  >(preselectedCategory || '');
  const [clarificationReply, setClarificationReply] = useState('');
  const [assistantGuidance, setAssistantGuidance] = useState<string | null>(
    null
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<GrievanceRecord | null>(
    null
  );

  const autoAnalyzedRef = useRef(false);

  useEffect(() => {
    if (preselectedCategory) {
      setSelectedCategory(preselectedCategory);
    }
  }, [preselectedCategory]);

  const applyAiPrefill = (analysis: GrievanceAIAnalysisResult) => {
    setAiAnalysis(analysis);
    if (analysis.enhanced_complaint) {
      setEnhancedComplaintText(analysis.enhanced_complaint);
    }
    if (analysis.department_category) {
      setSelectedCategory(analysis.department_category as GrievanceCategory);
    }

    const detectedIso = (analysis.detected_language || '').toLowerCase();
    if (detectedIso.includes('telugu') || detectedIso.startsWith('te')) {
      setLanguage('te');
    } else if (detectedIso.includes('hindi') || detectedIso.startsWith('hi')) {
      setLanguage('hi');
    } else if (
      detectedIso.includes('english') ||
      detectedIso.startsWith('en')
    ) {
      setLanguage('en');
    }

    // Prefill Section A only when explicitly extracted from complaint (never invent)
    if (analysis.citizen_name) {
      setCitizenName((prev) => prev.trim() || analysis.citizen_name || '');
    }
    if (analysis.contact_number) {
      setContactNumber((prev) => prev.trim() || analysis.contact_number || '');
    }
    if (analysis.email) {
      setEmail((prev) => prev.trim() || analysis.email || '');
    }
    if (analysis.designation) {
      setDesignation((prev) => prev.trim() || analysis.designation || '');
    }

    // Prefill Section B only when explicitly extracted from complaint
    const extractedVillageOrCity =
      analysis.location?.village ||
      analysis.location?.town ||
      analysis.location?.city ||
      '';
    if (extractedVillageOrCity) {
      setVillageOrCity((prev) => prev.trim() || extractedVillageOrCity);
    }

    const extractedAreaOrStreet = [
      analysis.location?.area,
      analysis.location?.street,
      analysis.location?.ward,
    ]
      .filter(Boolean)
      .join(', ');
    if (extractedAreaOrStreet) {
      setAreaOrStreet((prev) => prev.trim() || extractedAreaOrStreet);
    }

    if (analysis.location?.landmark) {
      setLandmark((prev) => prev.trim() || analysis.location.landmark || '');
    }
    if (analysis.location?.house_number) {
      setHouseNumber(
        (prev) => prev.trim() || analysis.location.house_number || ''
      );
    }
    if (analysis.location?.mandal) {
      setMandal((prev) => prev.trim() || analysis.location.mandal || '');
    }
    if (analysis.location?.district) {
      setDistrict((prev) => prev.trim() || analysis.location.district || '');
    }
    if (analysis.location?.pincode) {
      setPinCode((prev) => prev.trim() || analysis.location.pincode || '');
    }

    // Prefill Section C optional metadata when extracted
    if (analysis.problem_duration) {
      setProblemDuration(
        (prev) => prev.trim() || analysis.problem_duration || ''
      );
    }
    if (analysis.incident_date) {
      setIncidentDate((prev) => prev.trim() || analysis.incident_date || '');
    }
    if (analysis.affected_people) {
      setAffectedPeople(
        (prev) => prev.trim() || analysis.affected_people || ''
      );
    }
  };

  // Handle incoming Voice Modal navigation from Citizen Dashboard
  useEffect(() => {
    const navState = location.state as VoiceNavigationState | null;
    if (
      navState?.voiceTranscript &&
      navState.voiceTranscript.trim() &&
      !autoAnalyzedRef.current
    ) {
      autoAnalyzedRef.current = true;
      const incomingText = navState.voiceTranscript.trim();
      setDescription(incomingText);
      if (navState.detectedLanguage) {
        setLanguage(navState.detectedLanguage);
      }

      if (navState.autoAnalyze) {
        setIsAnalyzing(true);
        setError(null);
        setAssistantGuidance(null);
        analyzeCitizenGrievance({ transcript: incomingText })
          .then((analysis) => {
            applyAiPrefill(analysis);
            if (analysis.is_valid_grievance === false) {
              setAssistantGuidance(
                analysis.clarification_question ||
                  'Please describe the specific civic issue you would like to report.'
              );
              setStep(1);
            } else {
              setStep(2);
            }
          })
          .catch(() => {
            setError(
              'Unable to complete AI analysis automatically. Please review and click Analyze.'
            );
          })
          .finally(() => {
            setIsAnalyzing(false);
          });
      }
    }
  }, [location.state]);

  const loadSampleGrievance = (sampleLang: LanguageCode) => {
    setLanguage(sampleLang);
    setError(null);
    if (sampleLang === 'te') {
      setDescription(
        'నా పేరు రమేష్ కుమార్, మొబైల్ 9848022334. హైదరాబాద్ కూకట్‌పల్లి ఫేజ్ 3 కాలనీలో కమ్యూనిటీ హాల్ దగ్గర గత మూడు రోజులుగా మంచినీటి సరఫరా లేదు మరియు వాటర్ పైప్‌లైన్ లీకేజీ వల్ల 50 కుటుంబాలు తీవ్ర ఇబ్బంది పడుతున్నాము.'
      );
    } else if (sampleLang === 'hi') {
      setDescription(
        'मेरा नाम राजेश शर्मा है। हैदराबाद में चारमीनार लाड बाज़ार मुख्य सड़क पर हनुमान मंदिर के पास पिछले चार दिनों से स्ट्रीट लाइटें काम नहीं कर रही हैं, रात में बुजुर्गों और महिलाओं को परेशानी हो रही है।'
      );
    } else {
      setDescription(
        'My name is Arjun Reddy, mobile 9848022334. Deep potholes along Hyderabad Madhapur Main Road near Metro Pillar 1728 for the past 5 days causing severe traffic congestion and two-wheeler accidents.'
      );
    }
  };

  const handleAnalyzeStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAssistantGuidance(null);

    if (!description.trim() || description.trim().length < 3) {
      setError(t('validation.descriptionRequired'));
      return;
    }

    setIsAnalyzing(true);
    try {
      const compositeParts = [description.trim()];
      const manualLocParts = [
        villageOrCity.trim(),
        areaOrStreet.trim(),
        landmark.trim() ? `Landmark: ${landmark.trim()}` : '',
      ].filter(Boolean);
      if (manualLocParts.length > 0) {
        compositeParts.push(`Location: ${manualLocParts.join(', ')}`);
      }

      const analysis = await analyzeCitizenGrievance({
        transcript: compositeParts.join(' | '),
      });
      applyAiPrefill(analysis);
      if (analysis.is_valid_grievance === false) {
        setAssistantGuidance(
          analysis.clarification_question ||
            'Please describe the specific civic issue (Water, Roads, Garbage, Electricity, Streetlights, Drainage, or Public Safety) and the affected location.'
        );
        setStep(1);
      } else {
        setStep(2);
      }
    } catch {
      setError('Unable to analyze grievance at the moment. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClarificationSubmit = async () => {
    if (!clarificationReply.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const updated = await analyzeCitizenGrievance({
        transcript: clarificationReply.trim(),
        conversationContext: aiAnalysis
          ? {
              original_transcript: aiAnalysis.original_transcript || description,
              department_category:
                selectedCategory || aiAnalysis.department_category,
              location: aiAnalysis.location,
              citizen_name: citizenName || aiAnalysis.citizen_name,
              problem_duration: problemDuration || aiAnalysis.problem_duration,
            }
          : null,
      });
      setDescription(updated.original_transcript || description);
      applyAiPrefill(updated);
      setClarificationReply('');
      if (updated.is_valid_grievance !== false) {
        setAssistantGuidance(null);
        setStep(2);
      } else {
        setAssistantGuidance(updated.clarification_question || null);
      }
    } catch {
      setError('Unable to update analysis with your clarification. Please edit the fields directly.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validateMandatoryAndOptionalFields = (): string | null => {
    if (!citizenName.trim() || citizenName.trim().length < 2) {
      return t('validation.fullNameRequired');
    }
    if (!villageOrCity.trim()) {
      return t('validation.villageOrCityRequired');
    }
    if (!areaOrStreet.trim()) {
      return t('validation.areaOrStreetRequired');
    }
    if (!landmark.trim()) {
      return t('validation.landmarkRequired');
    }
    if (!description.trim() || description.trim().length < 10) {
      return t('validation.descriptionRequired');
    }

    // Optional field format validation (only when provided)
    if (contactNumber.trim()) {
      const digitsOnly = contactNumber.replace(/\D/g, '');
      const valid10 =
        (digitsOnly.length === 10 && /^[6-9]\d{9}$/.test(digitsOnly)) ||
        (digitsOnly.length === 12 && /^91[6-9]\d{9}$/.test(digitsOnly));
      if (!valid10) {
        return t('validation.invalidMobile');
      }
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return t('validation.invalidEmail');
      }
    }

    if (pinCode.trim()) {
      if (!/^\d{6}$/.test(pinCode.trim())) {
        return t('validation.invalidPinCode');
      }
    }

    return null;
  };

  const handleFinalSubmit = async () => {
    setError(null);
    const validationErr = validateMandatoryAndOptionalFields();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setSubmitting(true);
    try {
      const locationSegments = [
        houseNumber.trim(),
        areaOrStreet.trim(),
        landmark.trim() ? `Near ${landmark.trim()}` : '',
        mandal.trim() ? `${mandal.trim()} Mandal` : '',
        villageOrCity.trim(),
        district.trim(),
        stateName.trim(),
        pinCode.trim(),
      ].filter(Boolean);

      const finalLocationString =
        locationSegments.join(', ') || 'Hyderabad Municipal Area';

      const finalCategory: GrievanceCategory =
        (selectedCategory as GrievanceCategory) ||
        (aiAnalysis?.department_category as GrievanceCategory) ||
        'Public Safety';

      const contactParts = [
        contactNumber.trim(),
        email.trim(),
        designation.trim(),
      ].filter(Boolean);

      const { grievance: record } = await submitComplaint({
        language,
        description:
          enhancedComplaintText.trim() ||
          aiAnalysis?.enhanced_complaint ||
          description.trim(),
        originalTranscript: description.trim(),
        category: finalCategory,
        location: finalLocationString,
        locality: `${areaOrStreet.trim()}, ${villageOrCity.trim()}`,
        landmark: landmark.trim(),
        contact: contactParts.join(' | ') || undefined,
        citizenName: citizenName.trim(),
        priority: mapProvisionalToPriorityLevel(aiAnalysis?.priority),
        confidenceScore: aiAnalysis?.confidence_score ?? 1.0,
      });

      setCreatedTicket(record);
      setStep(3);
    } catch {
      setError('Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentDepartmentAsset = getVisualAssetForDepartmentOrCategory(
    selectedCategory || aiAnalysis?.department_category || 'Water Supply'
  );

  const isMissingMandatoryOnReview =
    !citizenName.trim() ||
    !villageOrCity.trim() ||
    !areaOrStreet.trim() ||
    !landmark.trim() ||
    !description.trim();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Stepper Header */}
      <section className="jana-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-sky-200/70">
          <div>
            <h1 className="text-xl font-bold text-[#102A56]">
              {t('registerComplaint.title')}
            </h1>
            <p className="text-xs text-[#63718A] mt-0.5">
              {t('registerComplaint.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span
              className={`px-2.5 py-1 rounded-lg ${
                step === 1
                  ? 'jana-btn-primary text-white font-semibold'
                  : 'bg-sky-50 text-[#63718A]'
              }`}
            >
              {t('registerComplaint.step1')}
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`px-2.5 py-1 rounded-lg ${
                step === 2
                  ? 'jana-btn-primary text-white font-semibold'
                  : 'bg-sky-50 text-[#63718A]'
              }`}
            >
              {t('registerComplaint.step2')}
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`px-2.5 py-1 rounded-lg ${
                step === 3
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-sky-50 text-[#63718A]'
              }`}
            >
              {t('registerComplaint.step3')}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Overlay when Auto-Analyzing from Dashboard Voice Modal */}
        {isAnalyzing && step === 1 && (
          <div className="mt-5 p-6 rounded-xl bg-sky-50/90 border border-sky-200 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-7 h-7 animate-spin text-[#1D4ED8]" />
            <div className="text-sm font-bold text-[#102A56]">
              {t('common.analyzing')}
            </div>
            <p className="text-xs text-[#63718A] max-w-md">
              Gemini 3.8 Flash is extracting citizen details, location,
              department classification, and preparing your formal complaint...
            </p>
          </div>
        )}

        {/* STEP 1: VOICE OR STRUCTURED FORM INPUT (SECTIONS A, B, C) */}
        {step === 1 && (
          <form onSubmit={handleAnalyzeStep1} className="space-y-6 pt-6">
            {/* Sample Multilingual Complaint Buttons */}
            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#102A56]">
                <Sparkles className="w-4 h-4 text-[#1D4ED8]" />
                <span>Try a Multilingual Demo Complaint:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadSampleGrievance('te')}
                  className="px-2.5 py-1 rounded-lg bg-[#FFFCF7] border border-sky-300 text-[#102A56] hover:border-[#1D4ED8] font-medium cursor-pointer"
                >
                  తెలుగు (Water Supply)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleGrievance('hi')}
                  className="px-2.5 py-1 rounded-lg bg-[#FFFCF7] border border-sky-300 text-[#102A56] hover:border-[#1D4ED8] font-medium cursor-pointer"
                >
                  हिन्दी (Streetlights)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleGrievance('en')}
                  className="px-2.5 py-1 rounded-lg bg-[#FFFCF7] border border-sky-300 text-[#102A56] hover:border-[#1D4ED8] font-medium cursor-pointer"
                >
                  English (Roads &amp; Potholes)
                </button>
              </div>
            </div>

            {/* SECTION C FIRST FOR VOICE-FIRST EXPERIENCE: VOICE & COMPLAINT DESCRIPTION */}
            <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-sky-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-sky-200/70">
                <div>
                  <h2 className="text-sm font-bold text-[#102A56] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#EA580C]" />
                    <span>{t('registerComplaint.sectionC.title')}</span>
                  </h2>
                  <p className="text-xs text-[#63718A] mt-0.5">
                    {t('registerComplaint.sectionC.desc')}
                  </p>
                </div>
                <ReadAloudButton text={description} language={language} />
              </div>

              {/* Voice-to-Grievance Component (Sarvam AI Saaras v4 + Browser Speech Fallback) */}
              <VoiceComplaintInput
                selectedLanguage={language}
                onLanguageChange={(detectedLang: LanguageCode) => {
                  setLanguage(detectedLang);
                }}
                currentDescription={description}
                onUpdateDescription={(confirmedText: string) => {
                  setDescription(confirmedText);
                  setError(null);
                }}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="grievance-description"
                    className="block text-xs font-semibold text-[#102A56]"
                  >
                    {t('registerComplaint.description')}
                  </label>
                  <span className="text-[11px] font-mono text-[#63718A]">
                    {description.length} chars
                  </span>
                </div>
                <textarea
                  id="grievance-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('registerComplaint.descriptionPlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              {/* Optional Complaint Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.duration')}
                  </label>
                  <input
                    type="text"
                    value={problemDuration}
                    onChange={(e) => setProblemDuration(e.target.value)}
                    placeholder={t('registerComplaint.durationPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.incidentDate')}
                  </label>
                  <input
                    type="text"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    placeholder={t('registerComplaint.incidentDatePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.affectedPeople')}
                  </label>
                  <input
                    type="text"
                    value={affectedPeople}
                    onChange={(e) => setAffectedPeople(e.target.value)}
                    placeholder={t(
                      'registerComplaint.affectedPeoplePlaceholder'
                    )}
                    className="w-full px-3 py-2 text-xs bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION A — CITIZEN INFORMATION */}
            <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-sky-200/90 space-y-4">
              <div className="pb-3 border-b border-sky-200/70">
                <h2 className="text-sm font-bold text-[#102A56] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1D4ED8]" />
                  <span>{t('registerComplaint.sectionA.title')}</span>
                </h2>
                <p className="text-xs text-[#63718A] mt-0.5">
                  {t('registerComplaint.sectionA.desc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.fullName')}
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder={t('registerComplaint.fullNamePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.mobile')}
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder={t('registerComplaint.mobilePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('registerComplaint.emailPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.designation')}
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder={t('registerComplaint.designationPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.citizenRefId')}
                  </label>
                  <input
                    type="text"
                    value={citizenReferenceId}
                    onChange={(e) => setCitizenReferenceId(e.target.value)}
                    placeholder="CIT-2026-DEMO01"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION B — LOCATION INFORMATION (RURAL & URBAN FRIENDLY) */}
            <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-sky-200/90 space-y-4">
              <div className="pb-3 border-b border-sky-200/70">
                <h2 className="text-sm font-bold text-[#102A56] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1D4ED8]" />
                  <span>{t('registerComplaint.sectionB.title')}</span>
                </h2>
                <p className="text-xs text-[#63718A] mt-0.5">
                  {t('registerComplaint.sectionB.desc')}
                </p>
              </div>

              {/* Mandatory Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.villageOrCity')}
                  </label>
                  <input
                    type="text"
                    value={villageOrCity}
                    onChange={(e) => setVillageOrCity(e.target.value)}
                    placeholder={t(
                      'registerComplaint.villageOrCityPlaceholder'
                    )}
                    className="w-full px-3 py-2 text-xs bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.areaOrStreet')}
                  </label>
                  <input
                    type="text"
                    value={areaOrStreet}
                    onChange={(e) => setAreaOrStreet(e.target.value)}
                    placeholder={t('registerComplaint.areaOrStreetPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.landmark')}
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder={t('registerComplaint.landmarkPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </div>

              {/* Optional Rural & Urban Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.houseNumber')}
                  </label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder={t('registerComplaint.houseNumberPlaceholder')}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-sky-200 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.mandal')}
                  </label>
                  <input
                    type="text"
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    placeholder={t('registerComplaint.mandalPlaceholder')}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-sky-200 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.district')}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={t('registerComplaint.districtPlaceholder')}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-sky-200 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.state')}
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder={t('registerComplaint.statePlaceholder')}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-sky-200 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.pinCode')}
                  </label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder={t('registerComplaint.pinCodePlaceholder')}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-sky-200 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </div>
            </div>

            {/* Supporting Attachment + Submit to AI Analysis */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="text-xs text-[#63718A]">
                <label className="font-semibold text-[#102A56] mr-2">
                  {t('registerComplaint.attachment')}:
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setAttachmentName(e.target.files?.[0]?.name || '')
                  }
                  className="text-xs text-[#63718A] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-100 file:text-[#102A56] hover:file:bg-sky-200"
                />
                {attachmentName && (
                  <span className="ml-2 font-mono text-[11px] text-[#1D4ED8]">
                    ({attachmentName})
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="jana-btn-accent px-6 py-3 text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('common.analyzing')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t('registerComplaint.analyzeBtn')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {assistantGuidance && step === 1 && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border-2 border-amber-300 space-y-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-950">
                  JANASEVA AI Assistant ({aiAnalysis?.intent_type || 'Clarification Needed'})
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {assistantGuidance}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: IMPROVED AI ANALYSIS REVIEW SCREEN (FEATURE 5) */}
        {step === 2 && aiAnalysis && (
          <div className="space-y-6 pt-6">
            {/* Immediate Danger Safety Advisory Banner */}
            {aiAnalysis.safety_advisory && (
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-400 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-red-950">
                    Immediate Safety Advisory
                  </div>
                  <p className="text-xs text-red-900 leading-relaxed">
                    {aiAnalysis.safety_advisory}
                  </p>
                </div>
              </div>
            )}

            {/* Mandatory Confirmation Notice Banner */}
            <div className="p-4 rounded-xl bg-amber-50/95 border-2 border-amber-300 flex items-start gap-3">
              <FileCheck2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-950">
                  {t('review.bannerNotice')}
                </div>
                <p className="text-[11px] text-amber-900">
                  {t('registerComplaint.prefillNotice')}
                </p>
              </div>
            </div>

            {isMissingMandatoryOnReview && (
              <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-300 flex items-center gap-2.5 text-xs font-semibold text-red-900">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{t('review.missingMandatoryWarning')}</span>
              </div>
            )}

            {/* Conversational Clarification Memory Box (Section 5) */}
            {aiAnalysis.clarification_question && (
              <div className="p-4 rounded-xl bg-sky-50/90 border border-sky-300 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#102A56] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#1D4ED8]" />
                      <span>JANASEVA AI Follow-up Question</span>
                    </div>
                    <p className="text-xs text-[#102A56] leading-relaxed">
                      {aiAnalysis.clarification_question}
                    </p>
                  </div>
                  <ReadAloudButton
                    text={aiAnalysis.clarification_question}
                    language={aiAnalysis.detected_language || language}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={clarificationReply}
                    onChange={(e) => setClarificationReply(e.target.value)}
                    placeholder="Reply here (e.g., Near the government school in Ramapuram village)..."
                    className="flex-1 px-3 py-2 text-xs bg-white border border-sky-300 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="button"
                    disabled={isAnalyzing || !clarificationReply.trim()}
                    onClick={handleClarificationSubmit}
                    className="jana-btn-primary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {isAnalyzing ? 'Updating...' : 'Update with Clarification'}
                  </button>
                </div>
              </div>
            )}

            {/* Multiple Identified Issues Panel (Section 4C) */}
            {aiAnalysis.identified_issues &&
              aiAnalysis.identified_issues.length > 1 && (
                <div className="p-4 rounded-xl bg-[#FFFCF7] border-2 border-sky-300 space-y-3">
                  <div className="text-xs font-bold text-[#102A56]">
                    Multiple Separate Civic Grievances Identified (
                    {aiAnalysis.identified_issues.length} Issues) — Select Which
                    Issue to Register First:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {aiAnalysis.identified_issues.map((issue) => {
                      const isSelected =
                        (selectedCategory || aiAnalysis.department_category) ===
                        issue.category;
                      return (
                        <button
                          key={issue.issue_number}
                          type="button"
                          onClick={() =>
                            setSelectedCategory(
                              issue.category as GrievanceCategory
                            )
                          }
                          className={`text-left p-3 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? 'border-[#1D4ED8] bg-sky-50/90 shadow-xs'
                              : 'border-sky-200 bg-white hover:border-sky-400'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-[#102A56]">
                            <span>
                              Issue {issue.issue_number}:{' '}
                              {translateCategory(issue.category)}
                            </span>
                            <span className="text-[10px] font-mono text-[#1D4ED8]">
                              {issue.department_id}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-[#1D4ED8] mt-0.5">
                            {translateDepartment(issue.department_name)}
                          </div>
                          <p className="text-[11px] text-[#63718A] mt-1 line-clamp-2">
                            {issue.problem_summary}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Assigned Department Visual Card + Classification Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-[#FFFCF7] border border-sky-200/90">
              <div className="md:col-span-5 aspect-video rounded-lg overflow-hidden border border-sky-200/70 bg-slate-900">
                <img
                  src={currentDepartmentAsset.bannerImage}
                  alt={currentDepartmentAsset.departmentName}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="md:col-span-7 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8]">
                    <Building2 className="w-4 h-4" />
                    <span>{t('review.assignedDepartment')}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-[#102A56] text-[11px] font-mono font-semibold">
                    {t('review.detectedLanguage')}:{' '}
                    {aiAnalysis.detected_language ||
                      formatLanguageName(language)}
                  </span>
                </div>

                <div className="text-lg font-bold text-[#102A56]">
                  {translateDepartment(currentDepartmentAsset.departmentName)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#63718A] mb-1">
                      {t('review.identifiedCategory')}
                    </label>
                    <select
                      value={
                        selectedCategory ||
                        aiAnalysis.department_category ||
                        'Public Safety'
                      }
                      onChange={(e) =>
                        setSelectedCategory(e.target.value as GrievanceCategory)
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-sky-300 rounded-lg text-[#102A56]"
                    >
                      <option value="Water Supply">
                        {translateCategory('Water Supply')}
                      </option>
                      <option value="Roads and Potholes">
                        {translateCategory('Roads and Potholes')}
                      </option>
                      <option value="Garbage Collection">
                        {translateCategory('Garbage Collection')}
                      </option>
                      <option value="Electricity">
                        {translateCategory('Electricity')}
                      </option>
                      <option value="Streetlights">
                        {translateCategory('Streetlights')}
                      </option>
                      <option value="Drainage">
                        {translateCategory('Drainage')}
                      </option>
                      <option value="Public Safety">
                        {translateCategory('Public Safety')}
                      </option>
                    </select>
                  </div>

                  <div>
                    <div className="text-[11px] text-[#63718A] mb-1">
                      {t('review.detectedUrgency')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${getPriorityColorClass(
                          mapProvisionalToPriorityLevel(aiAnalysis.priority)
                        )}`}
                      >
                        {translatePriority(aiAnalysis.priority || 'NORMAL')}
                      </span>
                    </div>
                    {aiAnalysis.priority_reason && (
                      <p className="text-[11px] text-[#63718A] mt-1">
                        {aiAnalysis.priority_reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 1. Original Complaint Transcript + Read Aloud + Editable */}
            <div className="p-4 rounded-xl bg-[#FFFCF7] border border-sky-200/90 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#102A56]">
                  1. {t('review.originalComplaint')}
                </label>
                <ReadAloudButton
                  text={description}
                  language={aiAnalysis.detected_language || language}
                />
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-sm bg-white border border-sky-300/80 rounded-xl text-[#102A56] focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            {/* 2. Gemini-Enhanced Formal Complaint + Read Aloud + Editable */}
            <div className="p-4 rounded-xl bg-sky-50/70 border-2 border-[#48A9E8]/60 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1D4ED8]" />
                  <label className="text-xs font-bold text-[#102A56]">
                    2. {t('review.enhancedComplaint')}
                  </label>
                </div>
                <ReadAloudButton
                  text={enhancedComplaintText}
                  language={aiAnalysis.detected_language || language}
                />
              </div>
              <textarea
                rows={4}
                value={enhancedComplaintText}
                onChange={(e) => setEnhancedComplaintText(e.target.value)}
                className="w-full p-3 text-sm bg-white border border-sky-300/90 rounded-xl text-[#102A56] focus:outline-none focus:border-[#1D4ED8] leading-relaxed"
              />
            </div>

            {/* 3. Extracted & Editable Citizen Information (Section A) */}
            <div className="p-5 rounded-xl bg-[#FFFCF7] border border-sky-200/90 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A56] flex items-center gap-2">
                <User className="w-4 h-4 text-[#1D4ED8]" />
                <span>{t('review.extractedCitizenInfo')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.fullName')}
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder={t('registerComplaint.fullNamePlaceholder')}
                    className={`w-full px-3 py-2 rounded-xl border bg-white focus:outline-none ${
                      !citizenName.trim()
                        ? 'border-red-400 bg-red-50/40'
                        : 'border-sky-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.mobile')}
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder={t('common.notProvided')}
                    className="w-full px-3 py-2 rounded-xl border border-sky-300 bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('common.notProvided')}
                    className="w-full px-3 py-2 rounded-xl border border-sky-300 bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.designation')}
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder={t('common.notProvided')}
                    className="w-full px-3 py-2 rounded-xl border border-sky-300 bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.citizenRefId')}
                  </label>
                  <input
                    type="text"
                    value={citizenReferenceId}
                    onChange={(e) => setCitizenReferenceId(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded-xl border border-sky-300 bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Extracted & Editable Location Information (Section B) */}
            <div className="p-5 rounded-xl bg-[#FFFCF7] border border-sky-200/90 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A56] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1D4ED8]" />
                <span>{t('review.extractedLocationInfo')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.villageOrCity')}
                  </label>
                  <input
                    type="text"
                    value={villageOrCity}
                    onChange={(e) => setVillageOrCity(e.target.value)}
                    placeholder={t(
                      'registerComplaint.villageOrCityPlaceholder'
                    )}
                    className={`w-full px-3 py-2 rounded-xl border bg-white focus:outline-none ${
                      !villageOrCity.trim()
                        ? 'border-red-400 bg-red-50/40'
                        : 'border-sky-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.areaOrStreet')}
                  </label>
                  <input
                    type="text"
                    value={areaOrStreet}
                    onChange={(e) => setAreaOrStreet(e.target.value)}
                    placeholder={t('registerComplaint.areaOrStreetPlaceholder')}
                    className={`w-full px-3 py-2 rounded-xl border bg-white focus:outline-none ${
                      !areaOrStreet.trim()
                        ? 'border-red-400 bg-red-50/40'
                        : 'border-sky-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#102A56] mb-1">
                    {t('registerComplaint.landmark')}
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder={t('registerComplaint.landmarkPlaceholder')}
                    className={`w-full px-3 py-2 rounded-xl border bg-white focus:outline-none ${
                      !landmark.trim()
                        ? 'border-red-400 bg-red-50/40'
                        : 'border-sky-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.houseNumber')}
                  </label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder={t('common.notProvided')}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-sky-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.mandal')}
                  </label>
                  <input
                    type="text"
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    placeholder={t('common.notProvided')}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-sky-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.district')}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={t('common.notProvided')}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-sky-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.state')}
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-sky-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.pinCode')}
                  </label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder={t('common.notProvided')}
                    className="w-full px-2.5 py-1.5 font-mono rounded-lg border border-sky-200 bg-white"
                  />
                </div>
              </div>

              {/* Optional Complaint Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-sky-100">
                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.duration')}
                  </label>
                  <input
                    type="text"
                    value={problemDuration}
                    onChange={(e) => setProblemDuration(e.target.value)}
                    placeholder={t('common.notProvided')}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-sky-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.incidentDate')}
                  </label>
                  <input
                    type="text"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    placeholder={t('common.notProvided')}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-sky-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#63718A] mb-1">
                    {t('registerComplaint.affectedPeople')}
                  </label>
                  <input
                    type="text"
                    value={affectedPeople}
                    onChange={(e) => setAffectedPeople(e.target.value)}
                    placeholder={t('common.notProvided')}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-sky-200 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="jana-btn-secondary px-5 py-2.5 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('review.backToEdit')}</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="jana-btn-accent px-6 py-3 text-sm font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('common.submitting')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('review.confirmAndSubmit')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TICKET CONFIRMATION */}
        {step === 3 && createdTicket && (
          <div className="pt-6 space-y-6">
            <div className="p-6 rounded-xl bg-emerald-50/90 border border-emerald-200 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-emerald-950">
                  {t('confirmation.title')}
                </h2>
                <p className="text-xs text-emerald-800">
                  {t('confirmation.subtitle')}
                </p>
                <div className="pt-2">
                  <div className="text-xs text-emerald-700">
                    {t('confirmation.ticketId')}
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#102A56]">
                    {createdTicket.ticket_id}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs p-4 rounded-xl bg-[#FFFCF7] border border-sky-200/80">
              <div>
                <div className="text-[#63718A]">
                  {t('review.identifiedCategory')}
                </div>
                <div className="font-semibold text-[#102A56] mt-0.5">
                  {translateCategory(createdTicket.predicted_category)}
                </div>
              </div>
              <div>
                <div className="text-[#63718A]">
                  {t('review.assignedDepartment')}
                </div>
                <div className="font-semibold text-[#1D4ED8] mt-0.5">
                  {translateDepartment(createdTicket.assigned_department)}
                </div>
              </div>
              <div>
                <div className="text-[#63718A]">{t('table.priority')}</div>
                <div
                  className={`mt-0.5 ${getPriorityColorClass(
                    createdTicket.priority
                  )}`}
                >
                  {translatePriority(createdTicket.priority)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/citizen/track?ticket=${encodeURIComponent(
                      createdTicket.ticket_id
                    )}`
                  )
                }
                className="jana-btn-primary px-5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer"
              >
                {t('confirmation.trackStatus')}
              </button>
              <Link
                to="/citizen/complaints"
                className="jana-btn-secondary px-5 py-2.5 text-xs font-semibold rounded-xl"
              >
                {t('confirmation.viewMyComplaints')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDescription('');
                  setEnhancedComplaintText('');
                  setAiAnalysis(null);
                  setCreatedTicket(null);
                  setStep(1);
                }}
                className="px-4 py-2.5 text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
              >
                {t('confirmation.submitAnother')}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
