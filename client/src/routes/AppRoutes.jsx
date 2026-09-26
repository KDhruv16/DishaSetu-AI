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

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Onboarding */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected Dashboard & App Layout */}
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

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};


