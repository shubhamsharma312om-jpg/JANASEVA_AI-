import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!subject.trim()) {
      setError('Please provide a subject for your inquiry.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError('Please enter a detailed message (at least 10 characters).');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Contact Form */}
      <section className="md:col-span-7 jana-card p-8">
        <h1 className="text-2xl font-bold text-[#102A56]">
          Contact JANASEVA AI Support
        </h1>
        <p className="text-xs text-[#63718A] mt-1 mb-6">
          Have questions about a municipal grievance ticket or platform support?
          Send us a message.
        </p>

        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Inquiry Submitted Successfully</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Thank you, <strong>{name}</strong>. Your message regarding &ldquo;
              {subject}&rdquo; has been recorded by the JANASEVA AI Hyderabad
              Pilot Support Desk.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
              }}
              className="jana-btn-primary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Support with Ticket JANA-HYD-2026-1042"
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                Message *
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or feedback..."
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <button
              type="submit"
              className="jana-btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl cursor-pointer"
            >
              Submit Inquiry
            </button>
          </form>
        )}
      </section>

      {/* Support Information Card */}
      <aside className="md:col-span-5 jana-card p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#102A56]">
            Hyderabad Pilot Support Desk
          </h2>
          <p className="text-xs text-[#63718A] mt-1">
            Demonstration contact information for Neural Storm 2026 (Track HI-02).
          </p>
        </div>

        <div className="space-y-4 text-xs text-[#63718A]">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#102A56]">Pilot Location</div>
              <div>
                Civic Redressal Innovation Hub, Tank Bund, Hyderabad - 500063
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#102A56]">
                Citizen Helpline (Demo)
              </div>
              <div className="font-mono">040-2111-1111 (24/7 Toll-Free)</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#102A56]">Support Email</div>
              <div className="font-mono">helpdesk@janaseva.demo</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
