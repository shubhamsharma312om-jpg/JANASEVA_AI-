import {
  AuthUser,
  CitizenUserRecord,
  DepartmentRecord,
  GrievanceRecord,
} from '../../types/janaseva';

const STORAGE_KEYS = {
  AUTH_USER: 'janaseva_auth_user_v1',
  GRIEVANCES: 'janaseva_grievances_v1',
  DEPARTMENTS: 'janaseva_departments_v1',
  CITIZENS: 'janaseva_citizens_v1',
  SETTINGS: 'janaseva_settings_v1',
};

export const INITIAL_DEPARTMENTS: DepartmentRecord[] = [
  {
    department_id: 'DEPT-WATER-01',
    department_name: 'Water Supply Department',
    supported_categories: ['Water Supply'],
    is_active: true,
    default_sla_hours: 24,
    description:
      'Piped water supply disruptions, contamination, low pressure, and main pipeline leakages.',
  },
  {
    department_id: 'DEPT-MUNI-02',
    department_name: 'Municipal Engineering',
    supported_categories: ['Roads and Potholes'],
    is_active: true,
    default_sla_hours: 72,
    description:
      'Potholes, damaged road surfaces, broken footpaths, and arterial road resurfacing.',
  },
  {
    department_id: 'DEPT-SANI-03',
    department_name: 'Sanitation Department',
    supported_categories: ['Garbage Collection'],
    is_active: true,
    default_sla_hours: 24,
    description:
      'Uncollected household waste, overflowing community bins, and street sweeping.',
  },
  {
    department_id: 'DEPT-ELEC-04',
    department_name: 'Electricity Department',
    supported_categories: ['Electricity'],
    is_active: true,
    default_sla_hours: 12,
    description:
      'Power outages, transformer faults, voltage fluctuations, and distribution line hazards.',
  },
  {
    department_id: 'DEPT-ELMT-05',
    department_name: 'Electrical Maintenance',
    supported_categories: ['Streetlights'],
    is_active: true,
    default_sla_hours: 48,
    description:
      'Non-functional street lamps, damaged light poles, and timer malfunctions on public streets.',
  },
  {
    department_id: 'DEPT-DRNG-06',
    department_name: 'Drainage Department',
    supported_categories: ['Drainage'],
    is_active: true,
    default_sla_hours: 24,
    description:
      'Blocked stormwater drains, sewage overflow, open manholes, and waterlogging.',
  },
  {
    department_id: 'DEPT-SAFE-07',
    department_name: 'Relevant Civic Authority',
    supported_categories: ['Public Safety'],
    is_active: true,
    default_sla_hours: 6,
    description:
      'Public hazards, fallen trees, unsafe civic structures, and urgent neighborhood safety concerns.',
  },
];

export const INITIAL_CITIZENS: CitizenUserRecord[] = [
  {
    citizen_id: 'CIT-2026-DEMO01',
    name: 'Arjun Reddy',
    email: 'citizen@janaseva.demo',
    mobile: '+91 98480 22334',
    preferred_language: 'te',
    address: 'Plot 42, Kukatpally Housing Board Phase 3, Hyderabad - 500072',
    created_at: '2026-10-12T08:30:00Z',
    total_complaints: 3,
    account_status: 'Active',
  },
  {
    citizen_id: 'CIT-2026-DEMO02',
    name: 'Priya Sharma',
    email: 'priya.sharma@hyderabad.in',
    mobile: '+91 97011 44556',
    preferred_language: 'hi',
    address: 'Flat 302, Banjara Hills Road No. 12, Hyderabad - 500034',
    created_at: '2026-10-15T10:15:00Z',
    total_complaints: 1,
    account_status: 'Active',
  },
  {
    citizen_id: 'CIT-2026-DEMO03',
    name: 'Mohammed Irfan',
    email: 'm.irfan@charminar.org',
    mobile: '+91 99490 77889',
    preferred_language: 'en',
    address: 'H.No. 22-7-110, Near Charminar Bus Terminal, Hyderabad - 500002',
    created_at: '2026-10-18T14:20:00Z',
    total_complaints: 1,
    account_status: 'Active',
  },
  {
    citizen_id: 'CIT-2026-DEMO04',
    name: 'Lakshmi Narayana',
    email: 'lakshmi.n@kukatpally.in',
    mobile: '+91 94401 11223',
    preferred_language: 'te',
    address: 'SR Nagar Main Road, Near Ameerpet Metro, Hyderabad - 500038',
    created_at: '2026-10-20T09:00:00Z',
    total_complaints: 1,
    account_status: 'Active',
  },
  {
    citizen_id: 'CIT-2026-DEMO05',
    name: 'Ananya Rao',
    email: 'ananya.rao@gachibowli.org',
    mobile: '+91 98850 66778',
    preferred_language: 'en',
    address: 'Jubilee Hills Road No. 36, Checkpost, Hyderabad - 500033',
    created_at: '2026-10-24T11:45:00Z',
    total_complaints: 1,
    account_status: 'Active',
  },
];

export const INITIAL_DEMO_GRIEVANCES: GrievanceRecord[] = [
  {
    ticket_id: 'JANA-HYD-2026-1042',
    citizen_id: 'CIT-2026-DEMO01',
    original_message:
      'మా కాలనీలో గత మూడు రోజులుగా మంచినీటి సరఫరా లేదు. కుకట్‌పల్లి ఫేజ్ 3 వాటర్ పైప్‌లైన్ లీకేజీ వల్ల తీవ్ర ఇబ్బంది పడుతున్నాము. | Location: Kukatpally Housing Board Phase 3, Near Community Hall',
    detected_language: 'te',
    translated_message:
      'No drinking water supply in Kukatpally Phase 3 for the past 3 days due to main pipeline leakage near Community Hall.',
    predicted_category: 'Water Supply',
    assigned_department: 'Water Supply Department',
    priority: 'HIGH',
    confidence_score: 1.0,
    status: 'IN_PROGRESS',
    created_at: '2026-10-28T07:30:00Z',
    updated_at: '2026-10-29T11:15:00Z',
    citizen_name: 'Arjun Reddy',
    citizen_contact: 'citizen@janaseva.demo | +91 98480 22334',
    history: [
      {
        history_id: 1,
        ticket_id: 'JANA-HYD-2026-1042',
        previous_status: null,
        new_status: 'SUBMITTED',
        remarks: 'Complaint registered by citizen via JANASEVA AI portal.',
        timestamp: '2026-10-28T07:30:00Z',
      },
      {
        history_id: 2,
        ticket_id: 'JANA-HYD-2026-1042',
        previous_status: 'SUBMITTED',
        new_status: 'ROUTED',
        remarks: 'Assigned to Water Supply Department based on Phase 1 category mapping.',
        timestamp: '2026-10-28T08:00:00Z',
      },
      {
        history_id: 3,
        ticket_id: 'JANA-HYD-2026-1042',
        previous_status: 'ROUTED',
        new_status: 'IN_PROGRESS',
        remarks:
          'Kukatpally Ward 114 maintenance crew dispatched to repair main valve leakage.',
        timestamp: '2026-10-29T11:15:00Z',
      },
    ],
  },
  {
    ticket_id: 'JANA-HYD-2026-1039',
    citizen_id: 'CIT-2026-DEMO01',
    original_message:
      'Deep potholes along Madhapur Hitec City Main Road near Metro Pillar 1728 causing severe traffic congestion and two-wheeler accidents during evening rain. | Location: Madhapur Main Road, Pillar 1728',
    detected_language: 'en',
    translated_message: null,
    predicted_category: 'Roads and Potholes',
    assigned_department: 'Municipal Engineering',
    priority: 'HIGH',
    confidence_score: 1.0,
    status: 'RESOLVED',
    created_at: '2026-10-21T09:20:00Z',
    updated_at: '2026-10-25T16:40:00Z',
    citizen_name: 'Arjun Reddy',
    citizen_contact: 'citizen@janaseva.demo | +91 98480 22334',
    history: [
      {
        history_id: 4,
        ticket_id: 'JANA-HYD-2026-1039',
        previous_status: null,
        new_status: 'SUBMITTED',
        remarks: 'Complaint registered by citizen.',
        timestamp: '2026-10-21T09:20:00Z',
      },
      {
        history_id: 5,
        ticket_id: 'JANA-HYD-2026-1039',
        previous_status: 'SUBMITTED',
        new_status: 'ROUTED',
        remarks: 'Assigned to Municipal Engineering (Roads and Potholes).',
        timestamp: '2026-10-21T10:05:00Z',
      },
      {
        history_id: 6,
        ticket_id: 'JANA-HYD-2026-1039',
        previous_status: 'ROUTED',
        new_status: 'IN_PROGRESS',
        remarks: 'Hot-mix asphalt patching initiated near Metro Pillar 1728.',
        timestamp: '2026-10-23T14:00:00Z',
      },
      {
        history_id: 7,
        ticket_id: 'JANA-HYD-2026-1039',
        previous_status: 'IN_PROGRESS',
        new_status: 'RESOLVED',
        remarks:
          'Pothole resurfacing completed and inspected by Ward Executive Engineer.',
        timestamp: '2026-10-25T16:40:00Z',
      },
    ],
  },
  {
    ticket_id: 'JANA-HYD-2026-1048',
    citizen_id: 'CIT-2026-DEMO01',
    original_message:
      'चारमीनार लाड बाज़ार के पास पिछले चार दिनों से स्ट्रीट लाइटें काम नहीं कर रही हैं, रात में बुजुर्गों और महिलाओं को चलने में परेशानी हो रही है। | Location: Laad Bazaar Main Street, Near Charminar',
    detected_language: 'hi',
    translated_message:
      'Streetlights near Charminar Laad Bazaar have not been working for the past four days.',
    predicted_category: 'Streetlights',
    assigned_department: 'Electrical Maintenance',
    priority: 'MEDIUM',
    confidence_score: 1.0,
    status: 'ROUTED',
    created_at: '2026-11-01T18:10:00Z',
    updated_at: '2026-11-01T19:00:00Z',
    citizen_name: 'Arjun Reddy',
    citizen_contact: 'citizen@janaseva.demo | +91 98480 22334',
    history: [
      {
        history_id: 8,
        ticket_id: 'JANA-HYD-2026-1048',
        previous_status: null,
        new_status: 'SUBMITTED',
        remarks: 'Complaint registered in Hindi.',
        timestamp: '2026-11-01T18:10:00Z',
      },
      {
        history_id: 9,
        ticket_id: 'JANA-HYD-2026-1048',
        previous_status: 'SUBMITTED',
        new_status: 'ROUTED',
        remarks: 'Assigned to Electrical Maintenance for Old City Zone.',
        timestamp: '2026-11-01T19:00:00Z',
      },
    ],
  },
  {
    ticket_id: 'JANA-HYD-2026-1051',
    citizen_id: 'CIT-2026-DEMO02',
    original_message:
      'बंजारा हिल्स रोड नंबर 12 के सामुदायिक कूड़ेदान से तीन दिनों से कचरा नहीं उठाया गया है, जिससे दुर्गंध और मच्छर बढ़ रहे हैं। | Location: Banjara Hills Road No. 12, Opposite City Park',
    detected_language: 'hi',
    translated_message:
      'Garbage has not been collected from the community bin on Banjara Hills Road No. 12 for three days.',
    predicted_category: 'Garbage Collection',
    assigned_department: 'Sanitation Department',
    priority: 'MEDIUM',
    confidence_score: 1.0,
    status: 'SUBMITTED',
    created_at: '2026-11-02T08:15:00Z',
    updated_at: '2026-11-02T08:15:00Z',
    citizen_name: 'Priya Sharma',
    citizen_contact: 'priya.sharma@hyderabad.in | +91 97011 44556',
    history: [
      {
        history_id: 10,
        ticket_id: 'JANA-HYD-2026-1051',
        previous_status: null,
        new_status: 'SUBMITTED',
        remarks: 'Complaint registered in Hindi for Banjara Hills Ward.',
        timestamp: '2026-11-02T08:15:00Z',
      },
    ],
  },
  {
    ticket_id: 'JANA-HYD-2026-1055',
    citizen_id: 'CIT-2026-DEMO03',
    original_message:
      'Stormwater drain overflow and open manhole chamber near Secunderabad Clock Tower main junction posing an immediate hazard to pedestrians and school buses. | Location: Secunderabad Clock Tower Junction',
    detected_language: 'en',
    translated_message: null,
    predicted_category: 'Drainage',
    assigned_department: 'Drainage Department',
    priority: 'CRITICAL',
    confidence_score: 1.0,
    status: 'IN_PROGRESS',
    created_at: '2026-11-02T10:05:00Z',
    updated_at: '2026-11-02T13:30:00Z',
    citizen_name: 'Mohammed Irfan',
    citizen_contact: 'm.irfan@charminar.org | +91 99490 77889',
    history: [
      {
        history_id: 11,
        ticket_id: 'JANA-HYD-2026-1055',
        previous_status: null,
        new_status: 'SUBMITTED',
        remarks: 'Critical drainage hazard reported.',
        timestamp: '2026-11-02T10:05:00Z',
      },
      {
        history_id: 12,
        ticket_id: 'JANA-HYD-2026-1055',
        previous_status: 'SUBMITTED',
        new_status: 'ROUTED',
        remarks: 'Assigned to Drainage Department emergency response.',
        timestamp: '2026-11-02T10:20:00Z',
      },
      {
        history_id: 13,
        ticket_id: 'JANA-HYD-2026-1055',
        previous_status: 'ROUTED',
        new_status: 'IN_PROGRESS',
        remarks: 'Safety barricades placed; jetting machine deployed to clear blockage.',
        timestamp: '2026-11-02T13:30:00Z',
      },
    ],
  },
];

export const localStore = {
  getAuthUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setAuthUser(user: AuthUser | null): void {
    try {
      if (!user) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      } else {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      }
    } catch {
      // ignore storage quota errors
    }
  },
  getGrievances(): GrievanceRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GRIEVANCES);
      return raw ? JSON.parse(raw) : INITIAL_DEMO_GRIEVANCES;
    } catch {
      return INITIAL_DEMO_GRIEVANCES;
    }
  },
  setGrievances(list: GrievanceRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GRIEVANCES, JSON.stringify(list));
    } catch {
      // ignore
    }
  },
  getDepartments(): DepartmentRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
      return raw ? JSON.parse(raw) : INITIAL_DEPARTMENTS;
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  },
  setDepartments(list: DepartmentRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(list));
    } catch {
      // ignore
    }
  },
  getCitizens(): CitizenUserRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CITIZENS);
      return raw ? JSON.parse(raw) : INITIAL_CITIZENS;
    } catch {
      return INITIAL_CITIZENS;
    }
  },
  setCitizens(list: CitizenUserRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(list));
    } catch {
      // ignore
    }
  },
};
