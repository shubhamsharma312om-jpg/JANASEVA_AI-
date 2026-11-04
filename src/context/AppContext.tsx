import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthUser,
  CitizenUserRecord,
  DepartmentRecord,
  GrievanceCategory,
  GrievanceRecord,
  LanguageCode,
  PriorityLevel,
} from '../types/janaseva';
import { apiService } from '../services/api';
import { localStore } from '../services/storage/localStore';

interface AppContextValue {
  user: AuthUser | null;
  grievances: GrievanceRecord[];
  departments: DepartmentRecord[];
  citizens: CitizenUserRecord[];
  loading: boolean;
  backendConnected: boolean;
  loginAsDemo: (role: 'citizen' | 'admin') => AuthUser;
  loginWithCredentials: (identifier: string, password: string) => AuthUser;
  registerCitizenAccount: (data: {
    name: string;
    email: string;
    mobile: string;
    preferred_language: LanguageCode;
  }) => AuthUser;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  submitComplaint: (payload: {
    language: LanguageCode;
    description: string;
    originalTranscript?: string;
    category: GrievanceCategory;
    location: string;
    locality: string;
    landmark: string;
    contact?: string;
    citizenName?: string;
    priority?: PriorityLevel;
    confidenceScore?: number;
  }) => Promise<{ grievance: GrievanceRecord; fromBackend: boolean }>;
  updateComplaintByAdmin: (
    ticketId: string,
    payload: {
      new_status: string;
      priority: PriorityLevel;
      assigned_department: string;
      remarks: string;
    }
  ) => Promise<{ grievance: GrievanceRecord; fromBackend: boolean }>;
  toggleDepartmentActive: (departmentId: string) => Promise<void>;
  updateDepartmentDetails: (
    departmentId: string,
    updates: Partial<DepartmentRecord>
  ) => void;
  addNewDepartment: (dept: DepartmentRecord) => void;
  toggleCitizenStatus: (citizenId: string) => void;
  findGrievanceByTicketId: (ticketId: string) => GrievanceRecord | undefined;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const DEMO_CITIZEN: AuthUser = {
  id: 'CIT-2026-DEMO01',
  role: 'citizen',
  name: 'Arjun Reddy',
  email: 'citizen@janaseva.demo',
  mobile: '+91 98480 22334',
  preferred_language: 'te',
  address: 'Plot 42, Kukatpally Housing Board Phase 3, Hyderabad - 500072',
  isDemoAuth: true,
};

const DEMO_ADMIN: AuthUser = {
  id: 'ADM-2026-HYD01',
  role: 'admin',
  name: 'Dr. Vikramaditya Rao, IAS (Demo)',
  email: 'admin@janaseva.demo',
  mobile: '+91 40 2111 1111',
  preferred_language: 'en',
  address: 'GHMC Head Office, Tank Bund Road, Hyderabad - 500063',
  isDemoAuth: true,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(() =>
    localStore.getAuthUser()
  );
  const [grievances, setGrievances] = useState<GrievanceRecord[]>(() =>
    localStore.getGrievances()
  );
  const [departments, setDepartments] = useState<DepartmentRecord[]>(() =>
    localStore.getDepartments()
  );
  const [citizens, setCitizens] = useState<CitizenUserRecord[]>(() =>
    localStore.getCitizens()
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [deptRes, grievRes] = await Promise.all([
        apiService.fetchDepartments(),
        apiService.fetchGrievances(),
      ]);
      setDepartments(deptRes.departments);
      setGrievances(grievRes.grievances);
      setBackendConnected(deptRes.fromBackend || grievRes.fromBackend);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const loginAsDemo = (role: 'citizen' | 'admin'): AuthUser => {
    const target = role === 'admin' ? DEMO_ADMIN : DEMO_CITIZEN;
    setUser(target);
    localStore.setAuthUser(target);
    return target;
  };

  const loginWithCredentials = (
    identifier: string,
    _password: string
  ): AuthUser => {
    const clean = identifier.trim().toLowerCase();
    if (clean === 'admin@janaseva.demo' || clean.includes('admin')) {
      return loginAsDemo('admin');
    }
    if (clean === 'citizen@janaseva.demo') {
      return loginAsDemo('citizen');
    }

    const matchCitizen = citizens.find(
      (c) =>
        c.email.toLowerCase() === clean ||
        c.mobile.replace(/\s+/g, '').includes(clean.replace(/\s+/g, ''))
    );

    if (matchCitizen) {
      const loggedIn: AuthUser = {
        id: matchCitizen.citizen_id,
        role: 'citizen',
        name: matchCitizen.name,
        email: matchCitizen.email,
        mobile: matchCitizen.mobile,
        preferred_language: matchCitizen.preferred_language,
        address: matchCitizen.address,
        isDemoAuth: true,
      };
      setUser(loggedIn);
      localStore.setAuthUser(loggedIn);
      return loggedIn;
    }

    // Default citizen session for valid input
    const customUser: AuthUser = {
      id: 'CIT-2026-DEMO01',
      role: 'citizen',
      name: clean.includes('@') ? clean.split('@')[0] : 'Hyderabad Citizen',
      email: clean.includes('@') ? clean : 'citizen@janaseva.demo',
      mobile: clean.includes('@') ? '+91 98480 22334' : identifier,
      preferred_language: 'en',
      address: 'Hyderabad, Telangana',
      isDemoAuth: true,
    };
    setUser(customUser);
    localStore.setAuthUser(customUser);
    return customUser;
  };

  const registerCitizenAccount = (data: {
    name: string;
    email: string;
    mobile: string;
    preferred_language: LanguageCode;
  }): AuthUser => {
    const newId = `CIT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const newCitizenRecord: CitizenUserRecord = {
      citizen_id: newId,
      name: data.name.trim(),
      email: data.email.trim(),
      mobile: data.mobile.trim(),
      preferred_language: data.preferred_language,
      address: 'Hyderabad, Telangana',
      created_at: now,
      total_complaints: 0,
      account_status: 'Active',
    };
    const nextCitizens = [newCitizenRecord, ...citizens];
    setCitizens(nextCitizens);
    localStore.setCitizens(nextCitizens);

    const authUser: AuthUser = {
      id: newId,
      role: 'citizen',
      name: newCitizenRecord.name,
      email: newCitizenRecord.email,
      mobile: newCitizenRecord.mobile,
      preferred_language: newCitizenRecord.preferred_language,
      address: newCitizenRecord.address,
      isDemoAuth: true,
    };
    setUser(authUser);
    localStore.setAuthUser(authUser);
    return authUser;
  };

  const logout = () => {
    setUser(null);
    localStore.setAuthUser(null);
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updatedUser: AuthUser = { ...user, ...updates };
    setUser(updatedUser);
    localStore.setAuthUser(updatedUser);

    if (user.role === 'citizen') {
      const nextCitizens = citizens.map((c) =>
        c.citizen_id === user.id
          ? {
              ...c,
              name: updatedUser.name,
              email: updatedUser.email,
              mobile: updatedUser.mobile,
              preferred_language: updatedUser.preferred_language,
              address: updatedUser.address,
            }
          : c
      );
      setCitizens(nextCitizens);
      localStore.setCitizens(nextCitizens);
    }
  };

  const submitComplaint = async (payload: {
    language: LanguageCode;
    description: string;
    originalTranscript?: string;
    category: GrievanceCategory;
    location: string;
    locality: string;
    landmark: string;
    contact?: string;
    citizenName?: string;
    priority?: PriorityLevel;
    confidenceScore?: number;
  }) => {
    const activeCitizenId = user?.id || 'CIT-2026-DEMO01';
    const locationString = [
      payload.location,
      payload.locality,
      payload.landmark ? `Landmark: ${payload.landmark}` : '',
    ]
      .filter(Boolean)
      .join(', ');

    const baseDescription = payload.description.trim();
    const combinedMessage =
      locationString && !baseDescription.includes(locationString)
        ? `${baseDescription} | Location: ${locationString}`
        : baseDescription;

    const result = await apiService.createGrievance({
      original_message: combinedMessage,
      translated_message:
        payload.originalTranscript &&
        payload.originalTranscript.trim() !== baseDescription
          ? payload.originalTranscript.trim()
          : undefined,
      category: payload.category,
      language: payload.language,
      priority: payload.priority || 'MEDIUM',
      confidence_score: payload.confidenceScore ?? 1.0,
      citizen_id: activeCitizenId,
      citizen_name:
        payload.citizenName?.trim() || user?.name || 'Anonymous Citizen',
      citizen_contact:
        payload.contact?.trim() ||
        (user ? `${user.email} | ${user.mobile}` : undefined),
    });

    const enriched: GrievanceRecord = {
      ...result.grievance,
      location: payload.location,
      locality: payload.locality,
      landmark: payload.landmark,
    };

    const nextGrievances = [
      enriched,
      ...grievances.filter((g) => g.ticket_id !== enriched.ticket_id),
    ];
    setGrievances(nextGrievances);
    localStore.setGrievances(nextGrievances);
    return { grievance: enriched, fromBackend: result.fromBackend };
  };

  const updateComplaintByAdmin = async (
    ticketId: string,
    payload: {
      new_status: string;
      priority: PriorityLevel;
      assigned_department: string;
      remarks: string;
    }
  ) => {
    const res = await apiService.updateGrievanceStatus(ticketId, payload);
    const nextList = grievances.map((g) =>
      g.ticket_id === ticketId ? res.grievance : g
    );
    setGrievances(nextList);
    localStore.setGrievances(nextList);
    return res;
  };

  const toggleDepartmentActive = async (departmentId: string) => {
    const target = departments.find((d) => d.department_id === departmentId);
    if (!target) return;
    const nextActive = !target.is_active;
    await apiService.updateDepartmentStatus(departmentId, nextActive);
    const nextDepts = departments.map((d) =>
      d.department_id === departmentId ? { ...d, is_active: nextActive } : d
    );
    setDepartments(nextDepts);
    localStore.setDepartments(nextDepts);
  };

  const updateDepartmentDetails = (
    departmentId: string,
    updates: Partial<DepartmentRecord>
  ) => {
    const nextDepts = departments.map((d) =>
      d.department_id === departmentId ? { ...d, ...updates } : d
    );
    setDepartments(nextDepts);
    localStore.setDepartments(nextDepts);
  };

  const addNewDepartment = (dept: DepartmentRecord) => {
    const nextDepts = [...departments, dept];
    setDepartments(nextDepts);
    localStore.setDepartments(nextDepts);
  };

  const toggleCitizenStatus = (citizenId: string) => {
    const nextCitizens = citizens.map((c) =>
      c.citizen_id === citizenId
        ? {
            ...c,
            account_status:
              c.account_status === 'Active'
                ? ('Suspended' as const)
                : ('Active' as const),
          }
        : c
    );
    setCitizens(nextCitizens);
    localStore.setCitizens(nextCitizens);
  };

  const findGrievanceByTicketId = (ticketId: string) => {
    const clean = ticketId.trim().toUpperCase();
    return grievances.find((g) => g.ticket_id.toUpperCase() === clean);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        grievances,
        departments,
        citizens,
        loading,
        backendConnected,
        loginAsDemo,
        loginWithCredentials,
        registerCitizenAccount,
        logout,
        updateProfile,
        submitComplaint,
        updateComplaintByAdmin,
        toggleDepartmentActive,
        updateDepartmentDetails,
        addNewDepartment,
        toggleCitizenStatus,
        findGrievanceByTicketId,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
