import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../components/LoginPage';
import { AuthCallback } from '../components/AuthCallback';
import { ProtectedRoute } from './ProtectedRoute';
import { HomePage } from '../components/home/HomePage';
import { TicketList } from '../components/tickets/TicketList';
import { CustomerList } from '../components/CustomerList';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { SettingsPage } from '../components/settings/SettingsPage';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { TicketDetail } from '../components/tickets/TicketDetail';
import { TeamPage } from '../components/teams/TeamPage';
import { AgentsPage } from '../components/agents/AgentsPage';
import { KnowledgeBase } from '../components/knowledge/KnowledgeBase';
import { SignupWalkthrough } from '../components/signup/SignupWalkthrough';
import { OnboardingWalkthrough } from '../components/OnboardingWalkthrough';
import SupportFAQPage from '../components/homepage/SupportFAQPage';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <SupportFAQPage />,
  },
  {
    path: '/customer/login',
    element: <LoginPage userType="customer" />,
  },
  {
    path: '/agent/login',
    element: <LoginPage userType="agent" />,
  },
  {
    path: '/admin/login',
    element: <LoginPage userType="admin" />,
  },
  {
    path: '/onboarding',
    element: <OnboardingWalkthrough />
  },
  {
    path: '/signup',
    element: <SignupWalkthrough />
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/:role/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'tickets',
            children: [
              {
                index: true,
                element: <TicketList />,
              },
              {
                path: ':ticketId',
                element: <TicketDetail />,
              }
            ]
          },
          {
            path: 'teams',
            element: <TeamPage />,
          },
          {
            path: 'customers',
            element: <CustomerList />,
          },
          {
            path: 'analytics',
            element: <AnalyticsDashboard />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'agents',
            element: <AgentsPage />,
          },
          {
            path: 'knowledgebase',
            element: <KnowledgeBase />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
], {
  future: {
    v7_relativeSplatPath: true
  }
}); 