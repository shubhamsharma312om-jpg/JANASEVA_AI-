import { LanguageCode } from '../types/janaseva';

export type UILanguageCode = LanguageCode; // 'en' | 'te' | 'hi'

export const UI_LANGUAGE_OPTIONS: {
  code: UILanguageCode;
  label: string;
  nativeLabel: string;
  shortLabel: string;
}[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', shortLabel: 'EN' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', shortLabel: 'తె' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', shortLabel: 'हि' },
];

export const TRANSLATIONS: Record<UILanguageCode, Record<string, string>> = {
  en: {
    // Common & Brand
    'app.name': 'JANASEVA AI',
    'app.tagline': 'Every Voice Matters. Every Grievance Counts.',
    'app.portal.citizen': 'Citizen Grievance Portal',
    'app.portal.admin': 'Municipal Command Center',
    'app.pilot': 'Hyderabad Municipal Pilot',
    'app.multilingual': 'Multilingual Citizen Redressal',
    'common.uiLanguage': 'UI Language',
    'common.language': 'Language',
    'common.loading': 'Loading...',
    'common.analyzing': 'Analyzing complaint with AI...',
    'common.submitting': 'Registering grievance...',
    'common.searching': 'Searching...',
    'common.save': 'Save Changes',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.viewDetails': 'View Details',
    'common.manage': 'Manage',
    'common.manageTicket': 'Manage Ticket',
    'common.logout': 'Logout',
    'common.login': 'Login',
    'common.register': 'Register',
    'common.optional': 'Optional',
    'common.mandatory': 'Required',
    'common.notProvided': 'Not mentioned in complaint',
    'common.anonymousCitizen': 'Anonymous Citizen',

    // Navigation
    'nav.home': 'Home',
    'nav.trackComplaint': 'Track Complaint',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Dashboard',
    'nav.citizenDashboard': 'Citizen Dashboard',
    'nav.adminDashboard': 'Admin Dashboard',
    'nav.myComplaints': 'My Complaints',
    'nav.registerComplaint': 'Register Complaint',
    'nav.registerNewComplaint': 'Register New Complaint',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.allComplaints': 'All Complaints',
    'nav.departments': 'Departments',
    'nav.analytics': 'Analytics',
    'nav.userManagement': 'User Management',
    'nav.switchToCitizen': 'Switch to Citizen View',
    'nav.citizenWorkspace': 'Citizen Workspace',
    'nav.municipalAdmin': 'Hyderabad Municipal Administration',

    // Home Page
    'home.heroTitle': 'Every Voice Matters. Every Grievance Counts.',
    'home.heroDesc':
      'JANASEVA AI empowers citizens across Hyderabad and Telangana to report civic issues by speaking or typing in English, Telugu, or Hindi, route complaints directly to the responsible municipal department, and track resolution progress with full transparency.',
    'home.reportGrievance': 'Report a Grievance',
    'home.trackYourComplaint': 'Track Your Complaint',
    'home.civicDepartments': 'Civic Departments',
    'home.supportedLanguages': 'Supported Languages',
    'home.activeDemoTickets': 'Active Demo Tickets',
    'home.resolved': 'Resolved',
    'home.howItWorks': 'How JANASEVA AI Works',
    'home.howItWorksDesc':
      'A streamlined 4-step workflow from citizen grievance submission to verified resolution.',
    'home.step1.title': '01. Speak or Type in Your Language',
    'home.step1.desc':
      'Describe the civic issue in English, Telugu (తెలుగు), or Hindi (हिन्दी) along with your village/city, area, and landmark.',
    'home.step2.title': '02. AI Department Classification',
    'home.step2.desc':
      'Our AI engine extracts key details and routes your grievance to the responsible municipal department across 7 civic categories.',
    'home.step3.title': '03. Instant Ticket ID',
    'home.step3.desc':
      'Review the AI-enhanced formal complaint, confirm submission, and receive a unique tracking Ticket ID immediately.',
    'home.step4.title': '04. Track Resolution Live',
    'home.step4.desc':
      'Monitor every status transition (Submitted → Assigned → In Progress → Resolved) and read official field engineer remarks.',
    'home.sevenCategories': 'Seven Civic Grievance Categories & Departments',
    'home.sevenCategoriesDesc':
      'Direct department routing across 7 municipal infrastructure wings.',
    'home.registerAnyCategory': 'Register a Complaint in Any Category →',
    'home.reportIssue': 'Report Issue →',
    'home.whyChoose': 'Why Choose JANASEVA AI',
    'home.tryDemoLogin': 'Try Citizen or Admin Demo Login',
    'home.trackExisting': 'Track Existing Ticket (e.g. JANA-HYD-2026-1042)',

    // Login & Register Pages
    'login.title': 'Sign In to JANASEVA AI',
    'login.subtitle':
      'Access your Citizen Grievance Dashboard or Municipal Administration Console.',
    'login.emailOrMobile': 'Email or Mobile Number',
    'login.password': 'Password',
    'login.rememberMe': 'Remember me',
    'login.forgotPassword': 'Forgot password?',
    'login.signInBtn': 'Login',
    'login.noAccount': "Don't have a citizen account yet?",
    'login.createAccount': 'Create an account',
    'login.quickDemoTitle': 'One-Click Demo Login',
    'login.quickDemoDesc':
      'Simulated role-based authentication for evaluating Citizen and Municipal Admin workflows.',
    'login.citizenDemo': 'Citizen Demo Account',
    'login.openCitizenDashboard': 'Open Citizen Dashboard →',
    'login.adminDemo': 'Admin Demo Account',
    'login.openAdminDashboard': 'Open Admin Dashboard →',
    'register.title': 'Create Citizen Account',
    'register.subtitle':
      'Register to manage your civic complaints, track department updates, and customize language preferences.',
    'register.fullName': 'Full Name *',
    'register.email': 'Email Address *',
    'register.mobile': 'Mobile Number *',
    'register.preferredLanguage': 'Preferred Language *',
    'register.password': 'Password *',
    'register.confirmPassword': 'Confirm Password *',
    'register.createBtn': 'Create Account',
    'register.alreadyHaveAccount': 'Already have an account?',
    'register.signIn': 'Sign In',

    // Citizen Dashboard & Voice-First Action
    'dashboard.welcome': 'Welcome back',
    'dashboard.citizenId': 'Citizen ID',
    'dashboard.subtitle':
      'Track and manage your civic grievances across Hyderabad & Telangana.',
    'dashboard.trackByTicket': 'Track by Ticket ID',
    'dashboard.voiceFirst.title': 'Register a New Complaint',
    'dashboard.voiceFirst.subtitle':
      'Speak in your own language. We will help you register your grievance.',
    'dashboard.voiceFirst.tapToSpeak': 'Tap Microphone to Speak',
    'dashboard.voiceFirst.orTypeForm': 'Or open standard registration form →',
    'dashboard.voiceFirst.badge': 'Voice-First Multilingual AI',
    'dashboard.stats.total': 'Total Complaints',
    'dashboard.stats.pending': 'Pending (Submitted / Assigned)',
    'dashboard.stats.inProgress': 'In Progress',
    'dashboard.stats.resolved': 'Resolved',
    'dashboard.quickRegister.title': 'Register New Complaint',
    'dashboard.quickRegister.desc':
      'Submit a grievance in English, Telugu, or Hindi across any of the 7 municipal categories.',
    'dashboard.quickRegister.link': 'Start Multi-Step Registration',
    'dashboard.quickTrack.title': 'Track Complaint Status',
    'dashboard.quickTrack.desc':
      'Look up any JANASEVA AI Ticket ID to inspect department assignment and field engineer remarks.',
    'dashboard.quickTrack.link': 'Open Ticket Tracker',
    'dashboard.quickDept.title': 'Quick Report by Civic Department',
    'dashboard.quickDept.desc':
      'Select a department below to launch complaint registration pre-configured for that category.',
    'dashboard.recentComplaints': 'Recent Complaints',
    'dashboard.recentComplaintsDesc':
      'Your latest registered grievances and current resolution state.',
    'dashboard.viewAll': 'View All',
    'dashboard.emptyComplaints':
      'You have not registered any complaints yet. Click "Register a New Complaint" to begin.',
    'dashboard.recentActivity': 'Recent Status Activity',

    // Voice Recording Modal
    'voiceModal.title': 'Voice-to-Grievance Assistant',
    'voiceModal.subtitle':
      'Speak naturally in English, తెలుగు (Telugu), or हिन्दी (Hindi). Your speech will be converted into text and placed into your complaint description.',
    'voiceModal.selectSpokenLanguage': 'Spoken Language for Recognition:',
    'voiceModal.autoDetect': 'Auto-Detect (Recommended)',
    'voiceModal.startRecording': 'Start Speaking',
    'voiceModal.stopRecording': 'Stop Recording',
    'voiceModal.recording': 'Listening... Speak your complaint clearly',
    'voiceModal.transcribing':
      'Transcribing audio with Sarvam AI Saaras v4...',
    'voiceModal.transcriptLabel':
      'Recognized Speech Transcript (You can edit below):',
    'voiceModal.transcriptPlaceholder':
      'Your spoken grievance will appear here. You can also type or edit directly...',
    'voiceModal.recordAgain': 'Record Again',
    'voiceModal.continueToAi': 'Continue to Complaint Form →',
    'voiceModal.cancel': 'Cancel',
    'voiceModal.emptyWarning':
      'Please record your voice or type your complaint before continuing.',
    'voiceModal.tip':
      'Tip: Speak your complaint clearly. It will be placed into the Complaint Description box where you can listen via Read Aloud and select your department.',

    // Read Aloud (TTS)
    'tts.readAloud': 'Read Aloud',
    'tts.stopReading': 'Stop Reading',
    'tts.playing': 'Reading Aloud...',
    'tts.unavailable':
      'Voice playback is not supported or unavailable for this language on your browser.',
    'tts.fallbackNotice':
      'Using closest available system voice for playback.',

    // Citizen-Friendly Complaint Registration Page (Sections A, B, C & Review)
    'registerComplaint.title': 'Register a Civic Grievance',
    'registerComplaint.subtitle':
      'Speak or type your complaint in English, Telugu (తెలుగు), or Hindi (हिन्दी), listen to it with Read Aloud, select the municipal department, and proceed to review.',
    'registerComplaint.step1': '1. Speak & Enter Details',
    'registerComplaint.step2': '2. Review & Confirm',
    'registerComplaint.step3': '3. Ticket Confirmation',
    'registerComplaint.sectionA.title': 'Section A — Citizen Information',
    'registerComplaint.sectionA.desc':
      'Your full name is required for official ticket registration. Contact fields are optional.',
    'registerComplaint.fullName': 'Full Name *',
    'registerComplaint.fullNamePlaceholder': 'e.g., Ramesh Kumar / రమేష్ కుమార్',
    'registerComplaint.mobile': 'Mobile Number (Optional)',
    'registerComplaint.mobilePlaceholder': '+91 98480 22334',
    'registerComplaint.email': 'Email Address (Optional)',
    'registerComplaint.emailPlaceholder': 'citizen@example.com',
    'registerComplaint.citizenRefId': 'Existing Citizen Reference ID (Optional)',
    'registerComplaint.designation': 'Designation / Occupation (Optional)',
    'registerComplaint.designationPlaceholder':
      'e.g., Farmer, Teacher, RWA Member, Shopkeeper',

    'registerComplaint.sectionB.title':
      'Section B — Location Information (Rural & Urban Friendly)',
    'registerComplaint.sectionB.desc':
      'Provide practical location details so field officers can locate the issue in your village, town, or city.',
    'registerComplaint.villageOrCity': 'Village / Town / City *',
    'registerComplaint.villageOrCityPlaceholder':
      'e.g., Hyderabad, Warangal, or Pochampally Village',
    'registerComplaint.areaOrStreet': 'Area / Colony / Street *',
    'registerComplaint.areaOrStreetPlaceholder':
      'e.g., Kukatpally Phase 3, Road No. 12, or Main Bazaar Street',
    'registerComplaint.landmark': 'Nearby Landmark *',
    'registerComplaint.landmarkPlaceholder':
      'e.g., Near Hanuman Temple, Opposite Panchayat Office, Metro Pillar 1728',
    'registerComplaint.houseNumber': 'House / Plot Number (Optional)',
    'registerComplaint.houseNumberPlaceholder': 'e.g., H.No 4-12/A or Plot 42',
    'registerComplaint.mandal': 'Mandal / Tehsil / Zone (Optional)',
    'registerComplaint.mandalPlaceholder': 'e.g., Balanagar Mandal / Serilingampally',
    'registerComplaint.district': 'District (Optional)',
    'registerComplaint.districtPlaceholder': 'e.g., Hyderabad, Rangareddy, Medchal',
    'registerComplaint.state': 'State (Optional)',
    'registerComplaint.statePlaceholder': 'e.g., Telangana',
    'registerComplaint.pinCode': 'PIN Code (Optional)',
    'registerComplaint.pinCodePlaceholder': 'e.g., 500072',

    'registerComplaint.sectionC.title': 'Section C — Complaint Details & Department Selection',
    'registerComplaint.sectionC.desc':
      'Speak or type the civic problem in your own words, listen to it using Read Aloud, and select the department you want to complain to.',
    'registerComplaint.description': 'Complaint Description *',
    'registerComplaint.descriptionPlaceholder':
      'Describe the problem in English, తెలుగు, or हिन्दी. Mention where it is happening and how long it has existed...',
    'registerComplaint.duration': 'How long has the problem existed? (Optional)',
    'registerComplaint.durationPlaceholder': 'e.g., Past 3 days, Since 2 weeks',
    'registerComplaint.incidentDate': 'Incident Date / Started On (Optional)',
    'registerComplaint.incidentDatePlaceholder': 'e.g., Yesterday night, 28 Oct 2026',
    'registerComplaint.affectedPeople':
      'Approximate Number of People Affected (Optional)',
    'registerComplaint.affectedPeoplePlaceholder':
      'e.g., 50 families, Entire street, School children',
    'registerComplaint.attachment':
      'Supporting Photo / Document Reference (Optional)',

    'registerComplaint.analyzeBtn':
      'Proceed to Review →',
    'registerComplaint.prefillNotice':
      'Please verify your selected department, complaint description, citizen details, and location before confirming submission.',

    // Review Screen
    'review.bannerNotice':
      'Please review the information before submitting. Your complaint will be registered only after your confirmation.',
    'review.title': 'Citizen Grievance Review & Confirmation',
    'review.originalComplaint': 'Complaint Description',
    'review.enhancedComplaint': 'Additional Notes / Summary',
    'review.detectedLanguage': 'Complaint Language',
    'review.identifiedCategory': 'Selected Complaint Category',
    'review.assignedDepartment': 'Selected Municipal Department',
    'review.detectedUrgency': 'Priority Level',
    'review.extractedCitizenInfo': 'Citizen Information (Editable)',
    'review.extractedLocationInfo': 'Location Information (Editable)',
    'review.missingMandatoryWarning':
      'Please complete the highlighted required fields (*) below before confirming submission.',
    'review.backToEdit': '← Back to Edit Step',
    'review.confirmAndSubmit': 'Confirm & Register Grievance Ticket',

    // Validation Errors
    'validation.fullNameRequired':
      'Please enter your Full Name (required to register your complaint).',
    'validation.villageOrCityRequired':
      'Please enter your Village, Town, or City.',
    'validation.areaOrStreetRequired':
      'Please enter your Area, Colony, or Street name.',
    'validation.landmarkRequired':
      'Please enter a Nearby Landmark so field staff can locate the problem.',
    'validation.descriptionRequired':
      'Please enter or speak a clear complaint description (at least 10 characters).',
    'validation.invalidMobile':
      'Please enter a valid 10-digit Indian mobile number (or leave it blank).',
    'validation.invalidEmail':
      'Please enter a valid email address (or leave it blank).',
    'validation.invalidPinCode':
      'Please enter a valid 6-digit PIN code (or leave it blank).',

    // Confirmation Screen
    'confirmation.title': 'Grievance Registered Successfully',
    'confirmation.subtitle':
      'Your complaint has been logged in the JANASEVA AI database and routed to the assigned department.',
    'confirmation.ticketId': 'Official Grievance Ticket ID',
    'confirmation.trackStatus': 'Track Live Status',
    'confirmation.viewMyComplaints': 'View My Complaints',
    'confirmation.submitAnother': 'Submit Another Grievance',

    // Track & My Complaints
    'track.title': 'Track Grievance Resolution Status',
    'track.subtitle':
      'Enter your unique JANASEVA AI Ticket ID to inspect real-time status, assigned department, and field officer remarks.',
    'track.placeholder': 'Enter Ticket ID (e.g., JANA-HYD-2026-1042)',
    'track.button': 'Track Status',
    'track.activeDemoTickets': 'Active Demo Tickets:',
    'track.notFoundTitle': 'Ticket ID Not Found',
    'track.currentStatus': 'Current Status',
    'track.priority': 'Priority',
    'track.assignedDepartment': 'Assigned Municipal Department',
    'track.submissionDate': 'Submission Date',
    'track.languageAndLocation': 'Language & Location',
    'track.description': 'Citizen Grievance Description',
    'track.referenceSummary': 'Formal AI Reference Summary',

    'myComplaints.title': 'My Complaints',
    'myComplaints.subtitle':
      'All civic grievances registered under your citizen profile.',
    'myComplaints.searchPlaceholder': 'Search by Ticket ID or keyword...',
    'myComplaints.allStatuses': 'All Statuses',
    'myComplaints.allCategories': 'All Categories',
    'myComplaints.sortNewest': 'Sort by Date: Newest First',
    'myComplaints.sortOldest': 'Sort by Date: Oldest First',
    'myComplaints.empty': 'No complaints match your current filter criteria.',

    // Table Headers
    'table.ticketId': 'Ticket ID',
    'table.citizen': 'Citizen',
    'table.categoryAndDept': 'Category & Department',
    'table.description': 'Description',
    'table.date': 'Date',
    'table.priority': 'Priority',
    'table.status': 'Status',
    'table.action': 'Action',

    // Admin Dashboard & Pages
    'admin.dashboard.title': 'Municipal Command Dashboard',
    'admin.dashboard.subtitle':
      'Real-time overview of citizen grievances, departmental queues, and SLA compliance across Hyderabad.',
    'admin.manageAllComplaints': 'Manage All Complaints',
    'admin.departmentRouting': 'Department Routing',
    'admin.detailedAnalytics': 'Detailed Analytics',
    'admin.stats.overdue': 'Overdue (>48h)',
    'admin.chart1.title': '1. Complaints Overview by Category (Live Data)',
    'admin.chart2.title': '2. Department-wise Complaints (Live Data)',
    'admin.chart3.title': '3. Monthly Complaint Trends (Demo Historical + Live)',
    'admin.chart4.title': '4. Complaint Status Distribution (Live Data)',
    'admin.recentActivity': 'Top Departments & Recent Activity',
    'admin.complaints.title': 'All Citizen Complaints',
    'admin.complaints.subtitle':
      'Filter, triage, and manage all civic grievances across Hyderabad.',
    'admin.resetFilters': 'Reset Filters',
    'admin.allDepartments': 'All Departments',
    'admin.allPriorities': 'All Priorities',

    // Categories
    'category.Water Supply': 'Water Supply',
    'category.Roads and Potholes': 'Roads and Potholes',
    'category.Garbage Collection': 'Garbage Collection',
    'category.Electricity': 'Electricity',
    'category.Streetlights': 'Streetlights',
    'category.Drainage': 'Drainage',
    'category.Public Safety': 'Public Safety',

    // Departments
    'dept.Water Supply Department': 'Water Supply Department',
    'dept.Municipal Engineering': 'Municipal Engineering',
    'dept.Sanitation Department': 'Sanitation Department',
    'dept.Electricity Department': 'Electricity Department',
    'dept.Electrical Maintenance': 'Electrical Maintenance',
    'dept.Drainage Department': 'Drainage Department',
    'dept.Relevant Civic Authority': 'Relevant Civic Authority',

    // Statuses
    'status.SUBMITTED': 'Submitted',
    'status.ROUTED': 'Assigned',
    'status.ASSIGNED': 'Assigned',
    'status.IN_PROGRESS': 'In Progress',
    'status.RESOLVED': 'Resolved',
    'status.CLOSED': 'Resolved',
    'status.REJECTED': 'Rejected',

    // Priorities
    'priority.LOW': 'LOW',
    'priority.MEDIUM': 'MEDIUM',
    'priority.NORMAL': 'NORMAL',
    'priority.HIGH': 'HIGH',
    'priority.CRITICAL': 'CRITICAL',
  },

  te: {
    // Common & Brand
    'app.name': 'జనసేవ AI (JANASEVA AI)',
    'app.tagline': 'ప్రతి గొంతు ముఖ్యమే. ప్రతి ఫిర్యాదు విలువైనదే.',
    'app.portal.citizen': 'పౌర ఫిర్యాదుల పోర్టల్',
    'app.portal.admin': 'మున్సిపల్ కమాండ్ సెంటర్',
    'app.pilot': 'హైదరాబాద్ మున్సిపల్ పైలట్',
    'app.multilingual': 'బహుభాషా పౌర ఫిర్యాదుల పరిష్కార వేదిక',
    'common.uiLanguage': 'భాష (UI Language)',
    'common.language': 'భాష',
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.analyzing': 'AI ద్వారా ఫిర్యాదు విశ్లేషించబడుతోంది...',
    'common.submitting': 'ఫిర్యాదు నమోదు చేయబడుతోంది...',
    'common.searching': 'వెతుకుతోంది...',
    'common.save': 'మార్పులను సేవ్ చేయండి',
    'common.cancel': 'రద్దు చేయండి',
    'common.close': 'మూసివేయండి',
    'common.edit': 'సవరించండి',
    'common.back': 'వెనుకకు',
    'common.next': 'తదుపరి',
    'common.previous': 'మునుపటి',
    'common.viewDetails': 'వివరాలు చూడండి',
    'common.manage': 'నిర్వహించండి',
    'common.manageTicket': 'టికెట్ నిర్వహణ',
    'common.logout': 'లాగ్ అవుట్',
    'common.login': 'లాగిన్',
    'common.register': 'నమోదు',
    'common.optional': 'ఐచ్ఛికం (Optional)',
    'common.mandatory': 'తప్పనిసరి (Required)',
    'common.notProvided': 'ఫిర్యాదులో పేర్కొనలేదు',
    'common.anonymousCitizen': 'అజ్ఞాత పౌరుడు',

    // Navigation
    'nav.home': 'హోమ్',
    'nav.trackComplaint': 'ఫిర్యాదు స్థితి',
    'nav.about': 'మా గురించి',
    'nav.contact': 'సంప్రదించండి',
    'nav.dashboard': 'డ్యాష్‌బోర్డ్',
    'nav.citizenDashboard': 'పౌర డ్యాష్‌బోర్డ్',
    'nav.adminDashboard': 'అడ్మిన్ డ్యాష్‌బోర్డ్',
    'nav.myComplaints': 'నా ఫిర్యాదులు',
    'nav.registerComplaint': 'ఫిర్యాదు నమోదు',
    'nav.registerNewComplaint': 'కొత్త ఫిర్యాదు నమోదు చేయండి',
    'nav.profile': 'ప్రొఫైల్',
    'nav.settings': 'సెట్టింగ్‌లు',
    'nav.allComplaints': 'అన్ని ఫిర్యాదులు',
    'nav.departments': 'విభాగాలు',
    'nav.analytics': 'విశ్లేషణలు',
    'nav.userManagement': 'వినియోగదారుల నిర్వహణ',
    'nav.switchToCitizen': 'పౌర వీక్షణకు మారండి',
    'nav.citizenWorkspace': 'పౌర వేదిక',
    'nav.municipalAdmin': 'హైదరాబాద్ మున్సిపల్ పరిపాలన',

    // Home Page
    'home.heroTitle': 'ప్రతి గొంతు ముఖ్యమే. ప్రతి ఫిర్యాదు విలువైనదే.',
    'home.heroDesc':
      'జనసేవ AI ద్వారా పౌరులు తెలుగు, ఇంగ్లీష్ లేదా హిందీలో మాట్లాడి లేదా టైప్ చేసి తమ ప్రజా సమస్యలను సులభంగా నమోదు చేయవచ్చు, సంబంధిత శాఖకు పంపవచ్చు మరియు పరిష్కార స్థితిని ప్రత్యక్షంగా తెలుసుకోవచ్చు.',
    'home.reportGrievance': 'ఫిర్యాదు నమోదు చేయండి',
    'home.trackYourComplaint': 'ఫిర్యాదు స్థితిని తెలుసుకోండి',
    'home.civicDepartments': 'ప్రజా విభాగాలు',
    'home.supportedLanguages': 'మద్దతు ఉన్న భాషలు',
    'home.activeDemoTickets': 'చురుకైన టికెట్లు',
    'home.resolved': 'పరిష్కరించబడినవి',
    'home.howItWorks': 'జనసేవ AI ఎలా పనిచేస్తుంది',
    'home.howItWorksDesc':
      'ఫిర్యాదు నమోదు నుండి పూర్తి పరిష్కారం వరకు 4 సులభమైన దశలు.',
    'home.step1.title': '01. మీ భాషలో మాట్లాడండి లేదా టైప్ చేయండి',
    'home.step1.desc':
      'తెలుగు, ఇంగ్లీష్ లేదా హిందీలో మీ గ్రామం/నగరం, కాలనీ మరియు ల్యాండ్‌మార్క్ వివరాలతో సమస్యను తెలియజేయండి.',
    'home.step2.title': '02. AI ద్వారా శాఖ గుర్తింపు',
    'home.step2.desc':
      'మా AI ఇంజిన్ మీ ఫిర్యాదులోని వివరాలను గుర్తించి 7 మున్సిపల్ విభాగాలలో సరైన శాఖకు కేటాయిస్తుంది.',
    'home.step3.title': '03. తక్షణ టికెట్ ID',
    'home.step3.desc':
      'AI రూపొందించిన అధికారిక ఫిర్యాదును పరిశీలించి నిర్ధారించిన వెంటనే ప్రత్యేక టికెట్ ID పొందండి.',
    'home.step4.title': '04. పరిష్కార స్థితిని ట్రాక్ చేయండి',
    'home.step4.desc':
      'ఫిర్యాదు సమర్పణ నుండి పరిష్కారం వరకు ప్రతి దశను మరియు అధికారుల వ్యాఖ్యలను ప్రత్యక్షంగా చూడండి.',
    'home.sevenCategories': 'ఏడు ప్రధాన ప్రజా ఫిర్యాదు విభాగాలు',
    'home.sevenCategoriesDesc':
      'హైదరాబాద్‌లోని 7 మున్సిపల్ విభాగాలకు నేరుగా ఫిర్యాదుల కేటాయింపు.',
    'home.registerAnyCategory': 'ఏ విభాగంలోనైనా ఫిర్యాదు చేయండి →',
    'home.reportIssue': 'సమస్యను తెలపండి →',
    'home.whyChoose': 'జనసేవ AI ఎందుకు ఎంచుకోవాలి',
    'home.tryDemoLogin': 'పౌర లేదా అడ్మిన్ డెమో లాగిన్ ప్రయత్నించండి',
    'home.trackExisting': 'టికెట్ ట్రాక్ చేయండి (ఉదా: JANA-HYD-2026-1042)',

    // Login & Register Pages
    'login.title': 'జనసేవ AI కి సైన్ ఇన్ చేయండి',
    'login.subtitle':
      'మీ పౌర ఫిర్యాదుల డ్యాష్‌బోర్డ్ లేదా మున్సిపల్ అడ్మిన్ కన్సోల్‌ను యాక్సెస్ చేయండి.',
    'login.emailOrMobile': 'ఈమెయిల్ లేదా మొబైల్ నంబర్',
    'login.password': 'పాస్‌వర్డ్',
    'login.rememberMe': 'నన్ను గుర్తుంచుకో',
    'login.forgotPassword': 'పాస్‌వర్డ్ మర్చిపోయారా?',
    'login.signInBtn': 'లాగిన్ చేయండి',
    'login.noAccount': 'ఇంకా ఖాతా లేదా?',
    'login.createAccount': 'కొత్త ఖాతాను సృష్టించండి',
    'login.quickDemoTitle': 'ఒక-క్లిక్ డెమో లాగిన్',
    'login.quickDemoDesc':
      'పౌర మరియు మున్సిపల్ అడ్మిన్ సేవలను పరీక్షించేందుకు తక్షణ డెమో లాగిన్.',
    'login.citizenDemo': 'పౌర డెమో ఖాతా',
    'login.openCitizenDashboard': 'పౌర డ్యాష్‌బోర్డ్ తెరవండి →',
    'login.adminDemo': 'అడ్మిన్ డెమో ఖాతా',
    'login.openAdminDashboard': 'అడ్మిన్ డ్యాష్‌బోర్డ్ తెరవండి →',
    'register.title': 'పౌర ఖాతాను సృష్టించండి',
    'register.subtitle':
      'మీ ఫిర్యాదులను నిర్వహించడానికి మరియు అప్‌డేట్‌లను పొందడానికి నమోదు చేసుకోండి.',
    'register.fullName': 'పూర్తి పేరు *',
    'register.email': 'ఈమెయిల్ చిరునామా *',
    'register.mobile': 'మొబైల్ నంబర్ *',
    'register.preferredLanguage': 'ప్రాధాన్య భాష *',
    'register.password': 'పాస్‌వర్డ్ *',
    'register.confirmPassword': 'పాస్‌వర్డ్ నిర్ధారించండి *',
    'register.createBtn': 'ఖాతాను సృష్టించండి',
    'register.alreadyHaveAccount': 'ఇప్పటికే ఖాతా ఉందా?',
    'register.signIn': 'సైన్ ఇన్ చేయండి',

    // Citizen Dashboard & Voice-First Action
    'dashboard.welcome': 'స్వాగతం',
    'dashboard.citizenId': 'పౌర ID',
    'dashboard.subtitle':
      'మీ ప్రజా ఫిర్యాదులను ఇక్కడి నుండే సులభంగా నమోదు చేయండి మరియు ట్రాక్ చేయండి.',
    'dashboard.trackByTicket': 'టికెట్ ID ద్వారా ట్రాక్ చేయండి',
    'dashboard.voiceFirst.title': 'కొత్త ఫిర్యాదు నమోదు చేయండి',
    'dashboard.voiceFirst.subtitle':
      'మీ సొంత భాషలో మాట్లాడండి. మీ ఫిర్యాదును నమోదు చేయడంలో మేము సహాయం చేస్తాము.',
    'dashboard.voiceFirst.tapToSpeak': 'మాట్లాడటానికి మైక్రోఫోన్ నొక్కండి',
    'dashboard.voiceFirst.orTypeForm': 'లేదా సాధారణ ఫారమ్ ద్వారా నమోదు చేయండి →',
    'dashboard.voiceFirst.badge': 'వాయిస్-ఫస్ట్ బహుభాషా AI',
    'dashboard.stats.total': 'మొత్తం ఫిర్యాదులు',
    'dashboard.stats.pending': 'పెండింగ్‌లో ఉన్నవి',
    'dashboard.stats.inProgress': 'పురోగతిలో ఉన్నవి',
    'dashboard.stats.resolved': 'పరిష్కరించబడినవి',
    'dashboard.quickRegister.title': 'కొత్త ఫిర్యాదు నమోదు చేయండి',
    'dashboard.quickRegister.desc':
      'తెలుగు, ఇంగ్లీష్ లేదా హిందీలో 7 మున్సిపల్ విభాగాలలో ఏ సమస్యపైనైనా ఫిర్యాదు చేయండి.',
    'dashboard.quickRegister.link': 'ఫిర్యాదు నమోదు ప్రారంభించండి',
    'dashboard.quickTrack.title': 'ఫిర్యాదు స్థితిని తెలుసుకోండి',
    'dashboard.quickTrack.desc':
      'టికెట్ ID ఆధారంగా కేటాయించిన శాఖ మరియు అధికారుల చర్యలను పరిశీలించండి.',
    'dashboard.quickTrack.link': 'టికెట్ ట్రాకర్ తెరవండి',
    'dashboard.quickDept.title': 'విభాగం వారీగా తక్షణ ఫిర్యాదు',
    'dashboard.quickDept.desc':
      'సంబంధిత శాఖపై క్లిక్ చేసి నేరుగా ఫిర్యాదు నమోదు ప్రారంభించండి.',
    'dashboard.recentComplaints': 'ఇటీవలి ఫిర్యాదులు',
    'dashboard.recentComplaintsDesc':
      'మీరు ఇటీవల నమోదు చేసిన ఫిర్యాదులు మరియు వాటి ప్రస్తుత స్థితి.',
    'dashboard.viewAll': 'అన్నీ చూడండి',
    'dashboard.emptyComplaints':
      'మీరు ఇంకా ఎలాంటి ఫిర్యాదులు నమోదు చేయలేదు. ప్రారంభించడానికి "కొత్త ఫిర్యాదు నమోదు చేయండి" బటన్‌ను నొక్కండి.',
    'dashboard.recentActivity': 'ఇటీవలి స్థితి మార్పులు',

    // Voice Recording Modal
    'voiceModal.title': 'వాయిస్ ద్వారా ఫిర్యాదు నమోదు',
    'voiceModal.subtitle':
      'తెలుగు, ఇంగ్లీష్ లేదా హిందీలో సహజంగా మాట్లాడండి. AI మీ మాటలను అక్షరాలలోకి మార్చి విశ్లేషిస్తుంది.',
    'voiceModal.selectSpokenLanguage': 'మాట్లాడే భాషను ఎంచుకోండి:',
    'voiceModal.autoDetect': 'ఆటో-డిటెక్ట్ (సిఫార్సు చేయబడింది)',
    'voiceModal.startRecording': 'మాట్లాడటం ప్రారంభించండి',
    'voiceModal.stopRecording': 'రికార్డింగ్ ఆపండి',
    'voiceModal.recording': 'వింటోంది... దయచేసి మీ సమస్యను స్పష్టంగా చెప్పండి',
    'voiceModal.transcribing':
      'Sarvam AI Saaras v4 ద్వారా మీ మాటలు టెక్స్ట్‌గా మార్చబడుతున్నాయి...',
    'voiceModal.transcriptLabel':
      'గుర్తించబడిన వాయిస్ టెక్స్ట్ (మీరు క్రింద సవరించవచ్చు):',
    'voiceModal.transcriptPlaceholder':
      'మీరు మాట్లాడిన ఫిర్యాదు ఇక్కడ కనిపిస్తుంది. మీరు నేరుగా టైప్ చేయవచ్చు లేదా సవరించవచ్చు...',
    'voiceModal.recordAgain': 'మళ్ళీ రికార్డ్ చేయండి',
    'voiceModal.continueToAi': 'ఫిర్యాదు ఫారమ్‌కు కొనసాగండి →',
    'voiceModal.cancel': 'రద్దు చేయండి',
    'voiceModal.emptyWarning':
      'కొనసాగే ముందు దయచేసి మీ ఫిర్యాదును రికార్డ్ చేయండి లేదా టైప్ చేయండి.',
    'voiceModal.tip':
      'సూచన: మీ సమస్యను స్పష్టంగా మాట్లాడండి. అది ఫిర్యాదు వివరణ బాక్స్‌లో చేర్చబడుతుంది.',

    // Read Aloud (TTS)
    'tts.readAloud': 'వినండి (Read Aloud)',
    'tts.stopReading': 'ఆపండి (Stop)',
    'tts.playing': 'చదువుతోంది...',
    'tts.unavailable':
      'మీ బ్రౌజర్‌లో ఈ భాషకు వాయిస్ రీడ్-అలౌడ్ సదుపాయం అందుబాటులో లేదు.',
    'tts.fallbackNotice': 'అందుబాటులో ఉన్న సిస్టమ్ వాయిస్ ఉపయోగించబడుతోంది.',

    // Citizen-Friendly Complaint Registration Page
    'registerComplaint.title': 'ప్రజా ఫిర్యాదును నమోదు చేయండి',
    'registerComplaint.subtitle':
      'తెలుగు, ఇంగ్లీష్ లేదా హిందీలో మాట్లాడి లేదా టైప్ చేసి మీ ఫిర్యాదును తెలపండి, వినండి (Read Aloud), సంబంధిత శాఖను ఎంచుకుని సమీక్షకు వెళ్ళండి.',
    'registerComplaint.step1': '1. మాట్లాడండి & వివరాలు నమోదు చేయండి',
    'registerComplaint.step2': '2. సమీక్ష & నిర్ధారణ',
    'registerComplaint.step3': '3. టికెట్ నిర్ధారణ',
    'registerComplaint.sectionA.title': 'విభాగం A — పౌరుని వివరాలు',
    'registerComplaint.sectionA.desc':
      'అధికారిక టికెట్ నమోదుకు మీ పూర్తి పేరు తప్పనిసరి. ఫోన్ మరియు ఈమెయిల్ ఐచ్ఛికం.',
    'registerComplaint.fullName': 'పూర్తి పేరు *',
    'registerComplaint.fullNamePlaceholder': 'ఉదా: రమేష్ కుమార్ / Ramesh Kumar',
    'registerComplaint.mobile': 'మొబైల్ నంబర్ (ఐచ్ఛికం)',
    'registerComplaint.mobilePlaceholder': '+91 98480 22334',
    'registerComplaint.email': 'ఈమెయిల్ చిరునామా (ఐచ్ఛికం)',
    'registerComplaint.emailPlaceholder': 'citizen@example.com',
    'registerComplaint.citizenRefId': 'పౌర రిఫరెన్స్ ID (ఐచ్ఛికం)',
    'registerComplaint.designation': 'వృత్తి / హోదా (ఐచ్ఛికం)',
    'registerComplaint.designationPlaceholder':
      'ఉదా: రైతు, ఉపాధ్యాయుడు, కాలనీ అధ్యక్షుడు',

    'registerComplaint.sectionB.title':
      'విభాగం B — చిరునామా / ప్రాంత వివరాలు (గ్రామీణ & పట్టణ పౌరులకు)',
    'registerComplaint.sectionB.desc':
      'అధికారులు సమస్య ఉన్న ప్రదేశాన్ని సులభంగా గుర్తించేందుకు మీ గ్రామం/నగరం, వీధి మరియు ల్యాండ్‌మార్క్ తెలపండి.',
    'registerComplaint.villageOrCity': 'గ్రామం / పట్టణం / నగరం *',
    'registerComplaint.villageOrCityPlaceholder':
      'ఉదా: హైదరాబాద్, వరంగల్, లేదా పోచంపల్లి గ్రామం',
    'registerComplaint.areaOrStreet': 'కాలనీ / ఏరియా / వీధి *',
    'registerComplaint.areaOrStreetPlaceholder':
      'ఉదా: కూకట్‌పల్లి ఫేజ్ 3, రోడ్ నం. 12, మెయిన్ బజార్',
    'registerComplaint.landmark': 'దగ్గరి ల్యాండ్‌మార్క్ (గుర్తు) *',
    'registerComplaint.landmarkPlaceholder':
      'ఉదా: హనుమాన్ గుడి దగ్గర, పంచాయతీ ఆఫీస్ ఎదురుగా, మెట్రో పిల్లర్ 1728',
    'registerComplaint.houseNumber': 'ఇంటి నంబర్ / ప్లాట్ నంబర్ (ఐచ్ఛికం)',
    'registerComplaint.houseNumberPlaceholder': 'ఉదా: ఇంటి నం. 4-12/A లేదా ప్లాట్ 42',
    'registerComplaint.mandal': 'మండలం / జోన్ (ఐచ్ఛికం)',
    'registerComplaint.mandalPlaceholder': 'ఉదా: బాలానగర్ మండలం / శేరిలింగంపల్లి',
    'registerComplaint.district': 'జిల్లా (ఐచ్ఛికం)',
    'registerComplaint.districtPlaceholder': 'ఉదా: హైదరాబాద్, రంగారెడ్డి, మేడ్చల్',
    'registerComplaint.state': 'రాష్ట్రం (ఐచ్ఛికం)',
    'registerComplaint.statePlaceholder': 'ఉదా: తెలంగాణ',
    'registerComplaint.pinCode': 'పిన్ కోడ్ (ఐచ్ఛికం)',
    'registerComplaint.pinCodePlaceholder': 'ఉదా: 500072',

    'registerComplaint.sectionC.title': 'విభాగం C — ఫిర్యాదు వివరాలు & శాఖ ఎంపిక',
    'registerComplaint.sectionC.desc':
      'మీ సమస్యను మాట్లాడండి లేదా టైప్ చేయండి, Read Aloud ద్వారా వినండి మరియు మీరు ఫిర్యాదు చేయాలనుకుంటున్న శాఖను ఎంచుకోండి.',
    'registerComplaint.description': 'ఫిర్యాదు వివరణ *',
    'registerComplaint.descriptionPlaceholder':
      'మీ సమస్యను తెలుగు, ఇంగ్లీష్ లేదా హిందీలో వివరించండి. సమస్య ఎక్కడ ఉందో మరియు ఎన్ని రోజులుగా ఉందో తెలపండి...',
    'registerComplaint.duration': 'ఈ సమస్య ఎన్ని రోజులుగా ఉంది? (ఐచ్ఛికం)',
    'registerComplaint.durationPlaceholder': 'ఉదా: గత 3 రోజులుగా, 2 వారాల నుండి',
    'registerComplaint.incidentDate': 'సమస్య మొదలైన తేదీ / సమయం (ఐచ్ఛికం)',
    'registerComplaint.incidentDatePlaceholder': 'ఉదా: నిన్న రాత్రి, 28 అక్టోబర్ 2026',
    'registerComplaint.affectedPeople':
      'సుమారు ఎంతమంది ప్రజలు ఇబ్బంది పడుతున్నారు? (ఐచ్ఛికం)',
    'registerComplaint.affectedPeoplePlaceholder':
      'ఉదా: 50 కుటుంబాలు, కాలనీ ప్రజలు, పాఠశాల విద్యార్థులు',
    'registerComplaint.attachment': 'ఫోటో / డాక్యుమెంట్ జతచేయండి (ఐచ్ఛికం)',

    'registerComplaint.analyzeBtn':
      'సమీక్షకు వెళ్ళండి (Proceed to Review) →',
    'registerComplaint.prefillNotice':
      'దయచేసి మీరు ఎంచుకున్న శాఖ, ఫిర్యాదు వివరణ, పౌరుని వివరాలు మరియు చిరునామాను నిర్ధారించండి.',

    // Review Screen
    'review.bannerNotice':
      'దయచేసి సమర్పించే ముందు సమాచారాన్ని సమీక్షించండి. మీ నిర్ధారణ తర్వాతే మీ ఫిర్యాదు నమోదు చేయబడుతుంది.',
    'review.title': 'పౌర ఫిర్యాదు సమీక్ష & నిర్ధారణ',
    'review.originalComplaint': 'ఫిర్యాదు వివరణ',
    'review.enhancedComplaint': 'అదనపు వివరాలు',
    'review.detectedLanguage': 'ఫిర్యాదు భాష',
    'review.identifiedCategory': 'ఎంచుకున్న ఫిర్యాదు వర్గం',
    'review.assignedDepartment': 'ఎంచుకున్న మున్సిపల్ శాఖ',
    'review.detectedUrgency': 'సమస్య తీవ్రత / ప్రాధాన్యత',
    'review.extractedCitizenInfo': 'పౌరుని వివరాలు (సవరించవచ్చు)',
    'review.extractedLocationInfo': 'చిరునామా / ప్రాంత వివరాలు (సవరించవచ్చు)',
    'review.missingMandatoryWarning':
      'దయచేసి ఫిర్యాదును నిర్ధారించే ముందు క్రింద హైలైట్ చేయబడిన తప్పనిసరి (*) వివరాలను పూర్తి చేయండి.',
    'review.backToEdit': '← వెనుకకు వెళ్ళి సవరించండి',
    'review.confirmAndSubmit': 'నిర్ధారించి ఫిర్యాదు టికెట్ నమోదు చేయండి',

    // Validation Errors
    'validation.fullNameRequired':
      'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి (ఫిర్యాదు నమోదుకు తప్పనిసరి).',
    'validation.villageOrCityRequired':
      'దయచేసి మీ గ్రామం, పట్టణం లేదా నగరం పేరును నమోదు చేయండి.',
    'validation.areaOrStreetRequired':
      'దయచేసి మీ కాలనీ, ఏరియా లేదా వీధి పేరును నమోదు చేయండి.',
    'validation.landmarkRequired':
      'అధికారులు ప్రదేశాన్ని గుర్తించేందుకు దయచేసి దగ్గరి ల్యాండ్‌మార్క్‌ను నమోదు చేయండి.',
    'validation.descriptionRequired':
      'దయచేసి మీ ఫిర్యాదు వివరణను స్పష్టంగా నమోదు చేయండి లేదా మాట్లాడండి.',
    'validation.invalidMobile':
      'దయచేసి సరైన 10-అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి (లేదా ఖాళీగా ఉంచండి).',
    'validation.invalidEmail':
      'దయచేసి సరైన ఈమెయిల్ చిరునామాను నమోదు చేయండి (లేదా ఖాళీగా ఉంచండి).',
    'validation.invalidPinCode':
      'దయచేసి సరైన 6-అంకెల పిన్ కోడ్‌ను నమోదు చేయండి (లేదా ఖాళీగా ఉంచండి).',

    // Confirmation Screen
    'confirmation.title': 'మీ ఫిర్యాదు విజయవంతంగా నమోదు చేయబడింది',
    'confirmation.subtitle':
      'మీ ఫిర్యాదు జనసేవ AI డేటాబేస్‌లో భద్రపరచబడి సంబంధిత మున్సిపల్ శాఖకు పంపబడింది.',
    'confirmation.ticketId': 'అధికారిక ఫిర్యాదు టికెట్ ID',
    'confirmation.trackStatus': 'ప్రత్యక్ష స్థితిని ట్రాక్ చేయండి',
    'confirmation.viewMyComplaints': 'నా ఫిర్యాదులను చూడండి',
    'confirmation.submitAnother': 'మరొక ఫిర్యాదు నమోదు చేయండి',

    // Track & My Complaints
    'track.title': 'ఫిర్యాదు పరిష్కార స్థితిని తెలుసుకోండి',
    'track.subtitle':
      'మీ జనసేవ AI టికెట్ ID ని నమోదు చేసి ప్రస్తుత స్థితి, కేటాయించిన శాఖ మరియు అధికారుల వ్యాఖ్యలను చూడండి.',
    'track.placeholder': 'టికెట్ ID నమోదు చేయండి (ఉదా: JANA-HYD-2026-1042)',
    'track.button': 'స్థితిని చూడండి',
    'track.activeDemoTickets': 'డెమో టికెట్లు:',
    'track.notFoundTitle': 'టికెట్ ID కనుగొనబడలేదు',
    'track.currentStatus': 'ప్రస్తుత స్థితి',
    'track.priority': 'ప్రాధాన్యత',
    'track.assignedDepartment': 'కేటాయించిన మున్సిపల్ శాఖ',
    'track.submissionDate': 'నమోదు చేసిన తేదీ',
    'track.languageAndLocation': 'భాష & ప్రాంతం',
    'track.description': 'పౌర ఫిర్యాదు వివరణ',
    'track.referenceSummary': 'AI అధికారిక సారాంశం',

    'myComplaints.title': 'నా ఫిర్యాదులు',
    'myComplaints.subtitle': 'మీ ప్రొఫైల్ కింద నమోదైన అన్ని ప్రజా ఫిర్యాదులు.',
    'myComplaints.searchPlaceholder': 'టికెట్ ID లేదా పదంతో వెతకండి...',
    'myComplaints.allStatuses': 'అన్ని స్థితులు',
    'myComplaints.allCategories': 'అన్ని విభాగాలు',
    'myComplaints.sortNewest': 'తేదీ: కొత్తవి ముందుగా',
    'myComplaints.sortOldest': 'తేదీ: పాతవి ముందుగా',
    'myComplaints.empty': 'మీ ఫిల్టర్‌లకు సరిపోయే ఫిర్యాదులు లేవు.',

    // Table Headers
    'table.ticketId': 'టికెట్ ID',
    'table.citizen': 'పౌరుడు',
    'table.categoryAndDept': 'వర్గం & శాఖ',
    'table.description': 'వివరణ',
    'table.date': 'తేదీ',
    'table.priority': 'ప్రాధాన్యత',
    'table.status': 'స్థితి',
    'table.action': 'చర్య',

    // Admin Dashboard & Pages
    'admin.dashboard.title': 'మున్సిపల్ కమాండ్ డ్యాష్‌బోర్డ్',
    'admin.dashboard.subtitle':
      'హైదరాబాద్ వ్యాప్తంగా పౌర ఫిర్యాదులు, విభాగాల వారీగా పనులు మరియు SLA పురోగతి యొక్క ప్రత్యక్ష సమీక్ష.',
    'admin.manageAllComplaints': 'అన్ని ఫిర్యాదులను నిర్వహించండి',
    'admin.departmentRouting': 'శాఖల వారీగా కేటాయింపు',
    'admin.detailedAnalytics': 'వివరమైన విశ్లేషణలు',
    'admin.stats.overdue': 'గడువు దాటినవి (>48గం)',
    'admin.chart1.title': '1. వర్గాల వారీగా ఫిర్యాదులు (ప్రత్యక్ష డేటా)',
    'admin.chart2.title': '2. శాఖల వారీగా ఫిర్యాదులు (ప్రత్యక్ష డేటా)',
    'admin.chart3.title': '3. నెలవారీ ఫిర్యాదుల సరళి',
    'admin.chart4.title': '4. ఫిర్యాదుల స్థితిగతుల విభజన',
    'admin.recentActivity': 'ప్రధాన శాఖలు & ఇటీవలి కార్యకలాపాలు',
    'admin.complaints.title': 'అన్ని పౌర ఫిర్యాదులు',
    'admin.complaints.subtitle':
      'హైదరాబాద్ వ్యాప్తంగా ఉన్న అన్ని ఫిర్యాదులను ఫిల్టర్ చేసి నిర్వహించండి.',
    'admin.resetFilters': 'ఫిల్టర్లు రీసెట్ చేయండి',
    'admin.allDepartments': 'అన్ని శాఖలు',
    'admin.allPriorities': 'అన్ని ప్రాధాన్యతలు',

    // Categories
    'category.Water Supply': 'మంచినీటి సరఫరా (Water Supply)',
    'category.Roads and Potholes': 'రోడ్లు మరియు గుంతలు (Roads & Potholes)',
    'category.Garbage Collection': 'చెత్త సేకరణ (Garbage Collection)',
    'category.Electricity': 'విద్యుత్ (Electricity)',
    'category.Streetlights': 'వీధి దీపాలు (Streetlights)',
    'category.Drainage': 'డ్రైనేజీ / మురుగునీరు (Drainage)',
    'category.Public Safety': 'ప్రజా భద్రత (Public Safety)',

    // Departments
    'dept.Water Supply Department': 'మంచినీటి సరఫరా శాఖ (Water Supply Dept)',
    'dept.Municipal Engineering': 'మున్సిపల్ ఇంజనీరింగ్ విభాగం',
    'dept.Sanitation Department': 'పారిశుద్ధ్య శాఖ (Sanitation Dept)',
    'dept.Electricity Department': 'విద్యుత్ శాఖ (Electricity Dept)',
    'dept.Electrical Maintenance': 'వీధి దీపాల నిర్వహణ విభాగం',
    'dept.Drainage Department': 'డ్రైనేజీ విభాగం (Drainage Dept)',
    'dept.Relevant Civic Authority': 'సంబంధిత ప్రజా భద్రతా విభాగం',

    // Statuses
    'status.SUBMITTED': 'సమర్పించబడింది',
    'status.ROUTED': 'కేటాయించబడింది',
    'status.ASSIGNED': 'కేటాయించబడింది',
    'status.IN_PROGRESS': 'పురోగతిలో ఉంది',
    'status.RESOLVED': 'పరిష్కరించబడింది',
    'status.CLOSED': 'పరిష్కరించబడింది',
    'status.REJECTED': 'తిరస్కరించబడింది',

    // Priorities
    'priority.LOW': 'తక్కువ (LOW)',
    'priority.MEDIUM': 'మధ్యస్థం (MEDIUM)',
    'priority.NORMAL': 'సాధారణం (NORMAL)',
    'priority.HIGH': 'అధికం (HIGH)',
    'priority.CRITICAL': 'అత్యవసరం (CRITICAL)',
  },

  hi: {
    // Common & Brand
    'app.name': 'जनसेवा AI (JANASEVA AI)',
    'app.tagline': 'हर आवाज़ मायने रखती है। हर शिकायत महत्वपूर्ण है।',
    'app.portal.citizen': 'नागरिक शिकायत पोर्टल',
    'app.portal.admin': 'म्युनिसिपल कमांड सेंटर',
    'app.pilot': 'हैदराबाद म्युनिसिपल पायलट',
    'app.multilingual': 'बहुभाषी नागरिक शिकायत निवारण मंच',
    'common.uiLanguage': 'भाषा (UI Language)',
    'common.language': 'भाषा',
    'common.loading': 'लोड हो रहा है...',
    'common.analyzing': 'AI द्वारा शिकायत का विश्लेषण किया जा रहा है...',
    'common.submitting': 'शिकायत दर्ज की जा रही है...',
    'common.searching': 'खोज रहा है...',
    'common.save': 'परिवर्तन सहेजें',
    'common.cancel': 'रद्द करें',
    'common.close': 'बंद करें',
    'common.edit': 'संपादित करें',
    'common.back': 'पीछे',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
    'common.viewDetails': 'विवरण देखें',
    'common.manage': 'प्रबंधित करें',
    'common.manageTicket': 'टिकट प्रबंधित करें',
    'common.logout': 'लॉग आउट',
    'common.login': 'लॉगिन',
    'common.register': 'पंजीकरण',
    'common.optional': 'वैकल्पिक (Optional)',
    'common.mandatory': 'अनिवार्य (Required)',
    'common.notProvided': 'शिकायत में उल्लेख नहीं है',
    'common.anonymousCitizen': 'अनाम नागरिक',

    // Navigation
    'nav.home': 'होम',
    'nav.trackComplaint': 'शिकायत ट्रैक करें',
    'nav.about': 'हमारे बारे में',
    'nav.contact': 'संपर्क करें',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.citizenDashboard': 'नागरिक डैशबोर्ड',
    'nav.adminDashboard': 'एडमिन डैशबोर्ड',
    'nav.myComplaints': 'मेरी शिकायतें',
    'nav.registerComplaint': 'शिकायत दर्ज करें',
    'nav.registerNewComplaint': 'नई शिकायत दर्ज करें',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.settings': 'सेटिंग्स',
    'nav.allComplaints': 'सभी शिकायतें',
    'nav.departments': 'विभाग',
    'nav.analytics': 'विश्लेषण (Analytics)',
    'nav.userManagement': 'उपयोगकर्ता प्रबंधन',
    'nav.switchToCitizen': 'नागरिक दृश्य पर जाएं',
    'nav.citizenWorkspace': 'नागरिक कार्यक्षेत्र',
    'nav.municipalAdmin': 'हैदराबाद नगर प्रशासन',

    // Home Page
    'home.heroTitle': 'हर आवाज़ मायने रखती है। हर शिकायत महत्वपूर्ण है।',
    'home.heroDesc':
      'जनसेवा AI नागरिकों को हिंदी, तेलुगु या अंग्रेजी में बोलकर या टाइप करके नागरिक समस्याओं की रिपोर्ट करने, संबंधित नगर विभाग को सीधे शिकायत भेजने और पूरी पारदर्शिता के साथ समाधान की स्थिति ट्रैक करने में सक्षम बनाता है।',
    'home.reportGrievance': 'शिकायत दर्ज करें',
    'home.trackYourComplaint': 'अपनी शिकायत ट्रैक करें',
    'home.civicDepartments': 'नागरिक विभाग',
    'home.supportedLanguages': 'समर्थित भाषाएं',
    'home.activeDemoTickets': 'सक्रिय टिकट',
    'home.resolved': 'समाधान हो चुका',
    'home.howItWorks': 'जनसेवा AI कैसे काम करता है',
    'home.howItWorksDesc':
      'शिकायत दर्ज करने से लेकर सत्यापित समाधान तक 4 सरल चरण।',
    'home.step1.title': '01. अपनी भाषा में बोलें या लिखें',
    'home.step1.desc':
      'हिंदी, तेलुगु या अंग्रेजी में अपने गाँव/शहर, कॉलोनी और लैंडमार्क के साथ समस्या का वर्णन करें।',
    'home.step2.title': '02. AI द्वारा विभाग वर्गीकरण',
    'home.step2.desc':
      'हमारा AI इंजन मुख्य विवरण निकालता है और 7 नागरिक श्रेणियों में से सही नगर विभाग को शिकायत सौंपता है।',
    'home.step3.title': '03. तत्काल टिकट ID',
    'home.step3.desc':
      'AI द्वारा तैयार औपचारिक शिकायत की समीक्षा करें, पुष्टि करें और तुरंत एक विशिष्ट ट्रैकिंग टिकट ID प्राप्त करें।',
    'home.step4.title': '04. लाइव समाधान ट्रैक करें',
    'home.step4.desc':
      'प्रत्येक स्थिति परिवर्तन (दर्ज → आवंटित → प्रगति पर → हल) और फील्ड इंजीनियर की टिप्पणियों की निगरानी करें।',
    'home.sevenCategories': 'सात नागरिक शिकायत श्रेणियां और विभाग',
    'home.sevenCategoriesDesc':
      'हैदराबाद के 7 नगर निगम विभागों में सीधा शिकायत रूटिंग।',
    'home.registerAnyCategory': 'किसी भी श्रेणी में शिकायत दर्ज करें →',
    'home.reportIssue': 'समस्या दर्ज करें →',
    'home.whyChoose': 'जनसेवा AI क्यों चुनें',
    'home.tryDemoLogin': 'नागरिक या एडमिन डेमो लॉगिन आज़माएं',
    'home.trackExisting': 'मौजूदा टिकट ट्रैक करें (जैसे JANA-HYD-2026-1042)',

    // Login & Register Pages
    'login.title': 'जनसेवा AI में साइन इन करें',
    'login.subtitle':
      'अपने नागरिक शिकायत डैशबोर्ड या नगर प्रशासन कंसोल तक पहुंचें।',
    'login.emailOrMobile': 'ईमेल या मोबाइल नंबर',
    'login.password': 'पासवर्ड',
    'login.rememberMe': 'मुझे याद रखें',
    'login.forgotPassword': 'पासवर्ड भूल गए?',
    'login.signInBtn': 'लॉगिन करें',
    'login.noAccount': 'क्या आपका नागरिक खाता नहीं है?',
    'login.createAccount': 'नया खाता बनाएं',
    'login.quickDemoTitle': 'वन-क्लिक डेमो लॉगिन',
    'login.quickDemoDesc':
      'नागरिक और एडमिन वर्कफ़्लो का परीक्षण करने के लिए त्वरित डेमो लॉगिन।',
    'login.citizenDemo': 'नागरिक डेमो खाता',
    'login.openCitizenDashboard': 'नागरिक डैशबोर्ड खोलें →',
    'login.adminDemo': 'एडमिन डेमो खाता',
    'login.openAdminDashboard': 'एडमिन डैशबोर्ड खोलें →',
    'register.title': 'नागरिक खाता बनाएं',
    'register.subtitle':
      'अपनी शिकायतों को प्रबंधित करने और विभागीय अपडेट प्राप्त करने के लिए पंजीकरण करें।',
    'register.fullName': 'पूरा नाम *',
    'register.email': 'ईमेल पता *',
    'register.mobile': 'मोबाइल नंबर *',
    'register.preferredLanguage': 'पसंदीदा भाषा *',
    'register.password': 'पासवर्ड *',
    'register.confirmPassword': 'पासवर्ड की पुष्टि करें *',
    'register.createBtn': 'खाता बनाएं',
    'register.alreadyHaveAccount': 'क्या पहले से खाता है?',
    'register.signIn': 'साइन इन करें',

    // Citizen Dashboard & Voice-First Action
    'dashboard.welcome': 'वापसी पर स्वागत है',
    'dashboard.citizenId': 'नागरिक ID',
    'dashboard.subtitle':
      'अपनी नागरिक शिकायतों को यहाँ से आसानी से दर्ज करें और ट्रैक करें।',
    'dashboard.trackByTicket': 'टिकट ID से ट्रैक करें',
    'dashboard.voiceFirst.title': 'नई शिकायत दर्ज करें',
    'dashboard.voiceFirst.subtitle':
      'अपनी भाषा में बोलें। हम आपकी शिकायत दर्ज करने में आपकी सहायता करेंगे।',
    'dashboard.voiceFirst.tapToSpeak': 'बोलने के लिए माइक्रोफ़ोन दबाएं',
    'dashboard.voiceFirst.orTypeForm': 'या सामान्य पंजीकरण फ़ॉर्म खोलें →',
    'dashboard.voiceFirst.badge': 'वॉयस-फ़र्स्ट बहुभाषी AI',
    'dashboard.stats.total': 'कुल शिकायतें',
    'dashboard.stats.pending': 'लंबित (प्रतीक्षारत)',
    'dashboard.stats.inProgress': 'प्रगति पर',
    'dashboard.stats.resolved': 'समाधान हो चुका',
    'dashboard.quickRegister.title': 'नई शिकायत दर्ज करें',
    'dashboard.quickRegister.desc':
      'हिंदी, तेलुगु या अंग्रेजी में 7 नगर श्रेणियों में से किसी में भी शिकायत दर्ज करें।',
    'dashboard.quickRegister.link': 'पंजीकरण शुरू करें',
    'dashboard.quickTrack.title': 'शिकायत की स्थिति ट्रैक करें',
    'dashboard.quickTrack.desc':
      'विभाग आवंटन और इंजीनियर की टिप्पणियों को देखने के लिए कोई भी टिकट ID खोजें।',
    'dashboard.quickTrack.link': 'टिकट ट्रैकर खोलें',
    'dashboard.quickDept.title': 'विभाग द्वारा त्वरित शिकायत',
    'dashboard.quickDept.desc':
      'उस श्रेणी के लिए शिकायत पंजीकरण शुरू करने के लिए नीचे किसी विभाग का चयन करें।',
    'dashboard.recentComplaints': 'हाल की शिकायतें',
    'dashboard.recentComplaintsDesc':
      'आपकी नवीनतम दर्ज शिकायतें और उनकी वर्तमान स्थिति।',
    'dashboard.viewAll': 'सभी देखें',
    'dashboard.emptyComplaints':
      'आपने अभी तक कोई शिकायत दर्ज नहीं की है। शुरू करने के लिए "नई शिकायत दर्ज करें" पर क्लिक करें।',
    'dashboard.recentActivity': 'हाल की स्थिति गतिविधियाँ',

    // Voice Recording Modal
    'voiceModal.title': 'वॉयस-टू-शिकायत सहायक',
    'voiceModal.subtitle':
      'हिंदी, तेलुगु या अंग्रेजी में स्वाभाविक रूप से बोलें। आपकी आवाज़ को टेक्स्ट में बदलकर AI द्वारा विश्लेषण किया जाएगा।',
    'voiceModal.selectSpokenLanguage': 'बोलने की भाषा चुनें:',
    'voiceModal.autoDetect': 'ऑटो-डिटेक्ट (अनुशंसित)',
    'voiceModal.startRecording': 'बोलना शुरू करें',
    'voiceModal.stopRecording': 'रिकॉर्डिंग रोकें',
    'voiceModal.recording': 'सुन रहा है... कृपया अपनी समस्या स्पष्ट रूप से बताएं',
    'voiceModal.transcribing':
      'Sarvam AI Saaras v4 द्वारा ऑडियो को टेक्स्ट में बदला जा रहा है...',
    'voiceModal.transcriptLabel':
      'पहचाना गया वॉयस टेक्स्ट (आप नीचे संपादित कर सकते हैं):',
    'voiceModal.transcriptPlaceholder':
      'आपकी बोली गई शिकायत यहाँ दिखाई देगी। आप सीधे टाइप या संपादित भी कर सकते हैं...',
    'voiceModal.recordAgain': 'फिर से रिकॉर्ड करें',
    'voiceModal.continueToAi': 'शिकायत फ़ॉर्म पर आगे बढ़ें →',
    'voiceModal.cancel': 'रद्द करें',
    'voiceModal.emptyWarning':
      'आगे बढ़ने से पहले कृपया अपनी आवाज़ रिकॉर्ड करें या अपनी शिकायत टाइप करें।',
    'voiceModal.tip':
      'सुझाव: अपनी समस्या स्पष्ट रूप से बोलें। यह शिकायत विवरण बॉक्स में जुड़ जाएगी।',

    // Read Aloud (TTS)
    'tts.readAloud': 'सुनें (Read Aloud)',
    'tts.stopReading': 'रोकें (Stop)',
    'tts.playing': 'पढ़ा जा रहा है...',
    'tts.unavailable':
      'आपके ब्राउज़र में इस भाषा के लिए वॉयस प्लेबैक उपलब्ध नहीं है।',
    'tts.fallbackNotice': 'उपलब्ध सिस्टम आवाज़ का उपयोग किया जा रहा है।',

    // Citizen-Friendly Complaint Registration Page
    'registerComplaint.title': 'नागरिक शिकायत दर्ज करें',
    'registerComplaint.subtitle':
      'हिंदी, तेलुगु या अंग्रेजी में बोलकर या लिखकर अपनी शिकायत दर्ज करें, Read Aloud से सुनें, संबंधित विभाग चुनें और समीक्षा के लिए आगे बढ़ें।',
    'registerComplaint.step1': '1. बोलें और विवरण दर्ज करें',
    'registerComplaint.step2': '2. समीक्षा और पुष्टि',
    'registerComplaint.step3': '3. टिकट पुष्टि',
    'registerComplaint.sectionA.title': 'अनुभाग A — नागरिक की जानकारी',
    'registerComplaint.sectionA.desc':
      'आधिकारिक टिकट पंजीकरण के लिए आपका पूरा नाम आवश्यक है। संपर्क फ़ील्ड वैकल्पिक हैं।',
    'registerComplaint.fullName': 'पूरा नाम *',
    'registerComplaint.fullNamePlaceholder': 'उदा: राजेश शर्मा / Rajesh Sharma',
    'registerComplaint.mobile': 'मोबाइल नंबर (वैकल्पिक)',
    'registerComplaint.mobilePlaceholder': '+91 98480 22334',
    'registerComplaint.email': 'ईमेल पता (वैकल्पिक)',
    'registerComplaint.emailPlaceholder': 'citizen@example.com',
    'registerComplaint.citizenRefId': 'नागरिक संदर्भ ID (वैकल्पिक)',
    'registerComplaint.designation': 'पद / व्यवसाय (वैकल्पिक)',
    'registerComplaint.designationPlaceholder':
      'उदा: किसान, शिक्षक, कॉलोनी अध्यक्ष, दुकानदार',

    'registerComplaint.sectionB.title':
      'अनुभाग B — स्थान की जानकारी (ग्रामीण और शहरी नागरिकों के लिए)',
    'registerComplaint.sectionB.desc':
      'व्यावहारिक स्थान विवरण प्रदान करें ताकि फील्ड अधिकारी आपके गाँव, कस्बे या शहर में समस्या का पता लगा सकें।',
    'registerComplaint.villageOrCity': 'गाँव / कस्बा / शहर *',
    'registerComplaint.villageOrCityPlaceholder':
      'उदा: हैदराबाद, वारंगल, या पोचमपल्ली गाँव',
    'registerComplaint.areaOrStreet': 'इलाका / कॉलोनी / गली *',
    'registerComplaint.areaOrStreetPlaceholder':
      'उदा: बंजारा हिल्स रोड नं. 12, या मुख्य बाज़ार गली',
    'registerComplaint.landmark': 'नज़दीकी लैंडमार्क (पहचान चिह्न) *',
    'registerComplaint.landmarkPlaceholder':
      'उदा: हनुमान मंदिर के पास, पंचायत भवन के सामने, मेट्रो पिलर 1728',
    'registerComplaint.houseNumber': 'मकान / प्लॉट नंबर (वैकल्पिक)',
    'registerComplaint.houseNumberPlaceholder': 'उदा: मकान नं. 4-12/A या प्लॉट 42',
    'registerComplaint.mandal': 'मंडल / तहसील / ज़ोन (वैकल्पिक)',
    'registerComplaint.mandalPlaceholder': 'उदा: बालानगर मंडल / सेरिलिंगमपल्ली',
    'registerComplaint.district': 'ज़िला (वैकल्पिक)',
    'registerComplaint.districtPlaceholder': 'उदा: हैदराबाद, रंगारेड्डी, मेडचल',
    'registerComplaint.state': 'राज्य (वैकल्पिक)',
    'registerComplaint.statePlaceholder': 'उदा: तेलंगाना',
    'registerComplaint.pinCode': 'पिन कोड (वैकल्पिक)',
    'registerComplaint.pinCodePlaceholder': 'उदा: 500072',

    'registerComplaint.sectionC.title': 'अनुभाग C — शिकायत का विवरण और विभाग चयन',
    'registerComplaint.sectionC.desc':
      'अपने शब्दों में समस्या बोलें या लिखें, Read Aloud से सुनें, और उस विभाग का चयन करें जिसमें आप शिकायत करना चाहते हैं।',
    'registerComplaint.description': 'शिकायत का विवरण *',
    'registerComplaint.descriptionPlaceholder':
      'हिंदी, तेलुगु या अंग्रेजी में समस्या का वर्णन करें। बताएं कि यह कहाँ हो रहा है और कब से है...',
    'registerComplaint.duration': 'यह समस्या कब से है? (वैकल्पिक)',
    'registerComplaint.durationPlaceholder': 'उदा: पिछले 3 दिनों से, 2 हफ्तों से',
    'registerComplaint.incidentDate': 'घटना की तारीख / कब शुरू हुई (वैकल्पिक)',
    'registerComplaint.incidentDatePlaceholder': 'उदा: कल रात, 28 अक्टूबर 2026',
    'registerComplaint.affectedPeople':
      'लगभग कितने लोग प्रभावित हैं? (वैकल्पिक)',
    'registerComplaint.affectedPeoplePlaceholder':
      'उदा: 50 परिवार, पूरी गली, स्कूली बच्चे',
    'registerComplaint.attachment': 'फोटो / दस्तावेज़ संदर्भ (वैकल्पिक)',

    'registerComplaint.analyzeBtn':
      'समीक्षा के लिए आगे बढ़ें (Proceed to Review) →',
    'registerComplaint.prefillNotice':
      'कृपया सबमिट करने से पहले अपने चुने हुए विभाग, शिकायत विवरण, नागरिक जानकारी और स्थान की पुष्टि करें।',

    // Review Screen
    'review.bannerNotice':
      'कृपया सबमिट करने से पहले जानकारी की समीक्षा करें। आपकी पुष्टि के बाद ही आपकी शिकायत दर्ज की जाएगी।',
    'review.title': 'नागरिक शिकायत समीक्षा और पुष्टि',
    'review.originalComplaint': 'शिकायत का विवरण',
    'review.enhancedComplaint': 'अतिरिक्त विवरण',
    'review.detectedLanguage': 'शिकायत की भाषा',
    'review.identifiedCategory': 'चुनी गई शिकायत श्रेणी',
    'review.assignedDepartment': 'चुना गया नगर विभाग',
    'review.detectedUrgency': 'प्राथमिकता स्तर',
    'review.extractedCitizenInfo': 'नागरिक की जानकारी (संपादन योग्य)',
    'review.extractedLocationInfo': 'स्थान की जानकारी (संपादन योग्य)',
    'review.missingMandatoryWarning':
      'कृपया सबमिट करने से पहले नीचे हाइलाइट किए गए अनिवार्य (*) फ़ील्ड पूरे करें।',
    'review.backToEdit': '← संपादन चरण पर वापस जाएं',
    'review.confirmAndSubmit': 'पुष्टि करें और शिकायत टिकट दर्ज करें',

    // Validation Errors
    'validation.fullNameRequired':
      'कृपया अपना पूरा नाम दर्ज करें (शिकायत दर्ज करने के लिए आवश्यक)।',
    'validation.villageOrCityRequired':
      'कृपया अपने गाँव, कस्बे या शहर का नाम दर्ज करें।',
    'validation.areaOrStreetRequired':
      'कृपया अपने इलाके, कॉलोनी या गली का नाम दर्ज करें।',
    'validation.landmarkRequired':
      'कृपया नज़दीकी लैंडमार्क दर्ज करें ताकि कर्मचारी स्थान ढूंढ सकें।',
    'validation.descriptionRequired':
      'कृपया स्पष्ट शिकायत विवरण दर्ज करें या बोलें।',
    'validation.invalidMobile':
      'कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें (या खाली छोड़ दें)।',
    'validation.invalidEmail':
      'कृपया एक मान्य ईमेल पता दर्ज करें (या खाली छोड़ दें)।',
    'validation.invalidPinCode':
      'कृपया एक मान्य 6-अंकीय पिन कोड दर्ज करें (या खाली छोड़ दें)।',

    // Confirmation Screen
    'confirmation.title': 'शिकायत सफलतापूर्वक दर्ज हो गई',
    'confirmation.subtitle':
      'आपकी शिकायत जनसेवा AI डेटाबेस में दर्ज कर ली गई है और संबंधित विभाग को भेज दी गई है।',
    'confirmation.ticketId': 'आधिकारिक शिकायत टिकट ID',
    'confirmation.trackStatus': 'लाइव स्थिति ट्रैक करें',
    'confirmation.viewMyComplaints': 'मेरी शिकायतें देखें',
    'confirmation.submitAnother': 'एक और शिकायत दर्ज करें',

    // Track & My Complaints
    'track.title': 'शिकायत समाधान स्थिति ट्रैक करें',
    'track.subtitle':
      'वास्तविक समय की स्थिति, आवंटित विभाग और अधिकारी की टिप्पणियों को देखने के लिए अपना जनसेवा AI टिकट ID दर्ज करें।',
    'track.placeholder': 'टिकट ID दर्ज करें (जैसे JANA-HYD-2026-1042)',
    'track.button': 'स्थिति ट्रैक करें',
    'track.activeDemoTickets': 'सक्रिय डेमो टिकट:',
    'track.notFoundTitle': 'टिकट ID नहीं मिला',
    'track.currentStatus': 'वर्तमान स्थिति',
    'track.priority': 'प्राथमिकता',
    'track.assignedDepartment': 'आवंटित नगर विभाग',
    'track.submissionDate': 'दर्ज करने की तिथि',
    'track.languageAndLocation': 'भाषा और स्थान',
    'track.description': 'नागरिक शिकायत विवरण',
    'track.referenceSummary': 'औपचारिक AI संदर्भ सारांश',

    'myComplaints.title': 'मेरी शिकायतें',
    'myComplaints.subtitle': 'आपके नागरिक प्रोफ़ाइल के तहत दर्ज सभी शिकायतें।',
    'myComplaints.searchPlaceholder': 'टिकट ID या शब्द से खोजें...',
    'myComplaints.allStatuses': 'सभी स्थितियाँ',
    'myComplaints.allCategories': 'सभी श्रेणियां',
    'myComplaints.sortNewest': 'तिथि: नवीनतम पहले',
    'myComplaints.sortOldest': 'तिथि: पुरानी पहले',
    'myComplaints.empty': 'आपके वर्तमान फ़िल्टर से कोई शिकायत मेल नहीं खाती।',

    // Table Headers
    'table.ticketId': 'टिकट ID',
    'table.citizen': 'नागरिक',
    'table.categoryAndDept': 'श्रेणी और विभाग',
    'table.description': 'विवरण',
    'table.date': 'तिथि',
    'table.priority': 'प्राथमिकता',
    'table.status': 'स्थिति',
    'table.action': 'कार्रवाई',

    // Admin Dashboard & Pages
    'admin.dashboard.title': 'म्युनिसिपल कमांड डैशबोर्ड',
    'admin.dashboard.subtitle':
      'हैदराबाद भर में नागरिक शिकायतों, विभागीय कतारों और SLA अनुपालन का वास्तविक समय अवलोकन।',
    'admin.manageAllComplaints': 'सभी शिकायतें प्रबंधित करें',
    'admin.departmentRouting': 'विभाग रूटिंग',
    'admin.detailedAnalytics': 'विस्तृत विश्लेषण',
    'admin.stats.overdue': 'अतिदेय (>48 घंटे)',
    'admin.chart1.title': '1. श्रेणी के अनुसार शिकायतें (लाइव डेटा)',
    'admin.chart2.title': '2. विभागवार शिकायतें (लाइव डेटा)',
    'admin.chart3.title': '3. मासिक शिकायत रुझान',
    'admin.chart4.title': '4. शिकायत स्थिति वितरण',
    'admin.recentActivity': 'शीर्ष विभाग और हाल की गतिविधियाँ',
    'admin.complaints.title': 'सभी नागरिक शिकायतें',
    'admin.complaints.subtitle':
      'हैदराबाद भर में सभी नागरिक शिकायतों को फ़िल्टर और प्रबंधित करें।',
    'admin.resetFilters': 'फ़िल्टर रीसेट करें',
    'admin.allDepartments': 'सभी विभाग',
    'admin.allPriorities': 'सभी प्राथमिकताएं',

    // Categories
    'category.Water Supply': 'जल आपूर्ति (Water Supply)',
    'category.Roads and Potholes': 'सड़कें और गड्ढे (Roads & Potholes)',
    'category.Garbage Collection': 'कचरा संग्रहण (Garbage Collection)',
    'category.Electricity': 'बिजली (Electricity)',
    'category.Streetlights': 'स्ट्रीट लाइट (Streetlights)',
    'category.Drainage': 'जल निकासी / ड्रेनेज (Drainage)',
    'category.Public Safety': 'जन सुरक्षा (Public Safety)',

    // Departments
    'dept.Water Supply Department': 'जल आपूर्ति विभाग (Water Supply Dept)',
    'dept.Municipal Engineering': 'नगर इंजीनियरिंग विभाग',
    'dept.Sanitation Department': 'स्वच्छता विभाग (Sanitation Dept)',
    'dept.Electricity Department': 'विद्युत विभाग (Electricity Dept)',
    'dept.Electrical Maintenance': 'विद्युत रखरखाव विभाग',
    'dept.Drainage Department': 'ड्रेनेज विभाग (Drainage Dept)',
    'dept.Relevant Civic Authority': 'संबंधित नागरिक सुरक्षा प्राधिकरण',

    // Statuses
    'status.SUBMITTED': 'दर्ज की गई',
    'status.ROUTED': 'आवंटित',
    'status.ASSIGNED': 'आवंटित',
    'status.IN_PROGRESS': 'प्रगति पर',
    'status.RESOLVED': 'समाधान हो गया',
    'status.CLOSED': 'समाधान हो गया',
    'status.REJECTED': 'अस्वीकृत',

    // Priorities
    'priority.LOW': 'कम (LOW)',
    'priority.MEDIUM': 'मध्यम (MEDIUM)',
    'priority.NORMAL': 'सामान्य (NORMAL)',
    'priority.HIGH': 'उच्च (HIGH)',
    'priority.CRITICAL': 'अति गंभीर (CRITICAL)',
  },
};
