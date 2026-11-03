import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_TO_DEPARTMENT } from '../../services/api';
import {
  GrievanceCategory,
  GrievanceRecord,
  LanguageCode,
} from '../../types/janaseva';
import { formatLanguageName } from '../../utils/formatters';
import { getVisualAssetForDepartmentOrCategory } from '../../utils/departmentAssets';
import { VoiceComplaintInput } from '../../components/citizen/VoiceComplaintInput';

const CATEGORIES: GrievanceCategory[] = [
  'Water Supply',
  'Roads and Potholes',
  'Garbage Collection',
  'Electricity',
  'Streetlights',
  'Drainage',
  'Public Safety',
];

export const RegisterComplaintPage: React.FC = () => {
  const { user, submitComplaint } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory =
    (searchParams.get('category') as GrievanceCategory) || 'Water Supply';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [language, setLanguage] = useState<LanguageCode>(
    user?.preferred_language || 'en'
  );
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GrievanceCategory>(
    CATEGORIES.includes(initialCategory) ? initialCategory : 'Water Supply'
  );
  const [location, setLocation] = useState('Hyderabad');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [contact, setContact] = useState(user?.mobile || '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{
    grievance: GrievanceRecord;
    fromBackend: boolean;
  } | null>(null);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!description.trim() || description.trim().length < 10) {
      setError(
        'Please enter a detailed complaint description (minimum 10 characters).'
      );
      return;
    }
    if (!locality.trim()) {
      setError('Please enter your area or locality in Hyderabad.');
      return;
    }
    setStep(2);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitComplaint({
        language,
        description,
        category,
        location,
        locality,
        landmark,
        contact,
      });
      setCreatedTicket(res);
      setStep(3);
    } catch (err: any) {
      setError(err?.message || 'Unable to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const mappedDept =
    CATEGORY_TO_DEPARTMENT[category] || 'Relevant Civic Authority';
  const selectedVisualAsset = getVisualAssetForDepartmentOrCategory(category);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="jana-card p-5 flex items-center justify-between text-xs font-semibold">
        <div className={step >= 1 ? 'text-[#1D4ED8]' : 'text-[#63718A]'}>
          Step 1: Complaint Details
        </div>
        <span className="text-slate-300">→</span>
        <div className={step >= 2 ? 'text-[#1D4ED8]' : 'text-[#63718A]'}>
          Step 2: Review &amp; Submit
        </div>
        <span className="text-slate-300">→</span>
        <div className={step === 3 ? 'text-emerald-700' : 'text-[#63718A]'}>
          Step 3: Confirmation
        </div>
      </div>

      {/* STEP 1: COMPLAINT DETAILS */}
      {step === 1 && (
        <section className="jana-card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-[#102A56]">
            Step 1 — Enter Complaint Details
          </h1>
          <p className="text-xs text-[#63718A] mt-1 mb-6">
            Submit your grievance in English, Telugu (తెలుగు), or Hindi
            (हिन्दी). Select a category below to map directly to the
            corresponding Hyderabad department.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleProceedToReview} className="space-y-6">
            {/* Visual Department & Category Selection Cards */}
            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-2.5">
                Select Grievance Category &amp; Department *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => {
                  const asset = getVisualAssetForDepartmentOrCategory(cat);
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-left rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1D4ED8] ring-2 ring-[#48A9E8]/40 bg-sky-50/70 shadow-sm'
                          : 'border-sky-200/80 bg-[#FFFCF7] hover:border-[#48A9E8]'
                      }`}
                    >
                      <div className="aspect-video w-full overflow-hidden bg-slate-900">
                        <img
                          src={asset.bannerImage}
                          alt={asset.departmentName}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div className="p-2.5">
                        <div className="text-xs font-bold text-[#102A56] truncate">
                          {cat}
                        </div>
                        <div className="text-[11px] text-[#1D4ED8] font-medium truncate">
                          {asset.departmentName}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                  Select Language *
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                >
                  <option value="en">English</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                  Selected Category (Dropdown Sync)
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as GrievanceCategory)
                  }
                  className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({CATEGORY_TO_DEPARTMENT[cat]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* VOICE-TO-GRIEVANCE ACCESSIBILITY MODULE (Immediately above Description Textarea) */}
            <VoiceComplaintInput
              selectedLanguage={language}
              onLanguageChange={setLanguage}
              currentDescription={description}
              onUpdateDescription={setDescription}
            />

            <div>
              <label
                htmlFor="complaint-description-textarea"
                className="block text-xs font-semibold text-[#102A56] mb-1.5"
              >
                Complaint Description *
              </label>
              <textarea
                id="complaint-description-textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === 'te'
                    ? 'మీ సమస్యను తెలుగులో వివరంగా రాయండి...'
                    : language === 'hi'
                    ? 'अपनी शिकायत का विवरण हिन्दी में लिखें...'
                    : 'Describe the civic issue, severity, and duration...'
                }
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                  City / Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                  Area or Locality *
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g., Kukatpally Phase 3"
                  className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                  Nearest Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g., Near Metro Pillar 1728"
                  className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                Optional Contact Details (Privacy-by-Design: Not Mandatory)
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Optional phone or email for resolution alerts"
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="jana-btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl cursor-pointer"
              >
                Continue to Review →
              </button>
            </div>
          </form>
        </section>
      )}

      {/* STEP 2: REVIEW AND SUBMIT */}
      {step === 2 && (
        <section className="jana-card p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-[#102A56]">
              Step 2 — Review and Submit
            </h1>
            <p className="text-xs text-[#63718A] mt-1">
              Verify your complaint details and assigned department before
              generating your Ticket ID.
            </p>
          </div>

          {/* Assigned Department Banner Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-[#FFFCF7] border border-sky-200/80">
            <div className="md:col-span-5 aspect-video rounded-lg overflow-hidden border border-sky-200/70 bg-slate-900">
              <img
                src={selectedVisualAsset.bannerImage}
                alt={mappedDept}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="md:col-span-7 space-y-1.5">
              <div className="text-xs font-semibold text-[#1D4ED8]">
                Target Civic Department
              </div>
              <div className="text-base font-bold text-[#102A56]">
                {mappedDept}
              </div>
              <div className="text-xs text-[#63718A]">
                Category: <strong className="text-[#102A56]">{category}</strong> ·{' '}
                {selectedVisualAsset.motto}
              </div>
            </div>
          </div>

          <div className="border border-sky-200/80 rounded-xl p-5 space-y-4 text-xs bg-[#FFFCF7]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[#63718A]">Selected Language</div>
                <div className="text-sm font-semibold text-[#102A56] mt-0.5">
                  {formatLanguageName(language)}
                </div>
              </div>
              <div>
                <div className="text-[#63718A]">Selected Category</div>
                <div className="text-sm font-semibold text-[#102A56] mt-0.5">
                  {category}
                </div>
              </div>
              <div>
                <div className="text-[#63718A]">
                  Assigned Department (Phase 1 Mapping)
                </div>
                <div className="text-sm font-semibold text-[#1D4ED8] mt-0.5">
                  {mappedDept}
                </div>
              </div>
              <div>
                <div className="text-[#63718A]">Location &amp; Locality</div>
                <div className="text-sm font-semibold text-[#102A56] mt-0.5">
                  {locality}, {location} {landmark ? `(${landmark})` : ''}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-sky-200/70">
              <div className="text-[#63718A] mb-1">Complaint Description</div>
              <p className="text-sm text-[#102A56] leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="jana-btn-secondary px-5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              ← Back to Edit
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmSubmit}
              className="jana-btn-accent px-6 py-2.5 text-sm font-semibold rounded-xl cursor-pointer"
            >
              {submitting
                ? 'Registering Ticket...'
                : 'Confirm & Submit Grievance'}
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: SUCCESS CONFIRMATION */}
      {step === 3 && createdTicket && (
        <section className="jana-card border-emerald-300/80 p-8 space-y-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h1 className="text-xl font-bold text-[#102A56]">
                Grievance Registered Successfully
              </h1>
              <p className="text-xs text-[#63718A] mt-1">
                {createdTicket.fromBackend
                  ? 'Saved directly to the SQLite database (janaseva.db) and synced with local storage.'
                  : 'Saved in persistent Demo Mode storage (localStorage).'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-[#FFFCF7] border border-sky-200/80">
            <div className="md:col-span-5 aspect-video rounded-lg overflow-hidden border border-sky-200/70 bg-slate-900">
              <img
                src={selectedVisualAsset.bannerImage}
                alt={createdTicket.grievance.assigned_department}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[#63718A]">Generated Ticket ID</div>
                <div className="text-lg font-bold font-mono text-[#102A56] mt-0.5">
                  {createdTicket.grievance.ticket_id}
                </div>
              </div>
              <div>
                <div className="text-[#63718A]">Assigned Department</div>
                <div className="text-sm font-semibold text-[#1D4ED8] mt-1">
                  {createdTicket.grievance.assigned_department}
                </div>
              </div>
              <div>
                <div className="text-[#63718A]">Category</div>
                <div className="text-sm font-semibold text-[#102A56] mt-0.5">
                  {createdTicket.grievance.predicted_category}
                </div>
              </div>
              <div>
                <div className="text-[#63718A]">Current Status</div>
                <div className="text-sm font-semibold text-emerald-700 mt-0.5">
                  Submitted
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/citizen/complaints/${createdTicket.grievance.ticket_id}`
                )
              }
              className="jana-btn-primary px-5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Track Complaint Details
            </button>
            <button
              type="button"
              onClick={() => navigate('/citizen/dashboard')}
              className="jana-btn-secondary px-5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
