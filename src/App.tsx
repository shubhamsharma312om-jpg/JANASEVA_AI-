/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PublicLayout } from './components/common/PublicLayout';
import { CitizenLayout } from './components/citizen/CitizenLayout';
import { AdminLayout } from './components/admin/AdminLayout';

// Public Website Pages (Pages 1 - 6)
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { TrackComplaintPage } from './pages/public/TrackComplaintPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';

// Citizen Dashboard Pages (Pages 7 - 12)
import { CitizenDashboardPage } from './pages/citizen/CitizenDashboardPage';
import { MyComplaintsPage } from './pages/citizen/MyComplaintsPage';
import { RegisterComplaintPage } from './pages/citizen/RegisterComplaintPage';
import { CitizenComplaintDetailsPage } from './pages/citizen/CitizenComplaintDetailsPage';
import { CitizenProfilePage } from './pages/citizen/CitizenProfilePage';
import { CitizenSettingsPage } from './pages/citizen/CitizenSettingsPage';

// Admin Dashboard Pages (Pages 13 - 19)
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminComplaintsPage } from './pages/admin/AdminComplaintsPage';
import { AdminComplaintDetailsPage } from './pages/admin/AdminComplaintDetailsPage';
import { AdminDepartmentsPage } from './pages/admin/AdminDepartmentsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC WEBSITE ROUTES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/track" element={<TrackComplaintPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* CITIZEN DASHBOARD ROUTES */}
          <Route path="/citizen" element={<CitizenLayout />}>
            <Route
              index
              element={<Navigate to="/citizen/dashboard" replace />}
            />
            <Route
              path="dashboard"
              element={<CitizenDashboardPage />}
            />
            <Route path="complaints" element={<MyComplaintsPage />} />
            <Route
              path="complaints/:ticketId"
              element={<CitizenComplaintDetailsPage />}
            />
            <Route path="register" element={<RegisterComplaintPage />} />
            <Route path="track" element={<TrackComplaintPage />} />
            <Route path="profile" element={<CitizenProfilePage />} />
            <Route path="settings" element={<CitizenSettingsPage />} />
          </Route>

          {/* ADMIN DASHBOARD ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="complaints" element={<AdminComplaintsPage />} />
            <Route
              path="complaints/:ticketId"
              element={<AdminComplaintDetailsPage />}
            />
            <Route path="departments" element={<AdminDepartmentsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
