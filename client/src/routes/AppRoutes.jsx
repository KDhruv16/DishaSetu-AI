import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CareerPage } from '../pages/CareerPage';
import { SkillGapPage } from '../pages/SkillGapPage';
import { RoadmapPage } from '../pages/RoadmapPage';
import { LearningPage } from '../pages/LearningPage';
import { OpportunitiesPage } from '../pages/OpportunitiesPage';
import { ResumePage } from '../pages/ResumePage';
import { InterviewPage } from '../pages/InterviewPage';
import { CareerAssistantPage } from '../pages/CareerAssistantPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

// Admin Module Components & Pages
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminEducationPage } from '../pages/admin/AdminEducationPage';
import { AdminRolesPage } from '../pages/admin/AdminRolesPage';
import { AdminSkillsPage } from '../pages/admin/AdminSkillsPage';
import { AdminRoleSkillsPage } from '../pages/admin/AdminRoleSkillsPage';
import { AdminQuestionsPage } from '../pages/admin/AdminQuestionsPage';
import { AdminLearningPage } from '../pages/admin/AdminLearningPage';
import { AdminRoadmapsPage } from '../pages/admin/AdminRoadmapsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Candidate Protected Flow */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Candidate Dashboard & App Layout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/skills" element={<SkillGapPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/assistant" element={<CareerAssistantPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/interview" element={<InterviewPage />} />
        </Route>
      </Route>

      {/* Admin Protected Portal */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/education" element={<AdminEducationPage />} />
          <Route path="/admin/roles" element={<AdminRolesPage />} />
          <Route path="/admin/skills" element={<AdminSkillsPage />} />
          <Route path="/admin/role-skills" element={<AdminRoleSkillsPage />} />
          <Route path="/admin/questions" element={<AdminQuestionsPage />} />
          <Route path="/admin/learning" element={<AdminLearningPage />} />
          <Route path="/admin/roadmaps" element={<AdminRoadmapsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};



