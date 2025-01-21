import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../components/LoginPage';
import { AuthCallback } from '../components/AuthCallback';
import { ProtectedRoute } from './ProtectedRoute';
import { HomePage } from '../components/home/HomePage';
import { TicketList } from '../components/TicketList';
import { CustomerList } from '../components/CustomerList';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { SettingsPage } from '../components/settings/SettingsPage';
import { HelpCenter } from '../components/help/HelpCenter';
import { DashboardLayout } from '../components/layouts/DashboardLayout';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: ':role/dashboard',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'tickets',
            element: <TicketList />,
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
            path: 'help',
            element: <HelpCenter />,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/login" replace />,
      },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true
  }
}); 