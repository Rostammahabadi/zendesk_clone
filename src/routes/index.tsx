import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../components/LoginPage';
import { AuthCallback } from '../components/AuthCallback';
import { ProtectedRoute } from './ProtectedRoute';
import { HomePage } from '../components/home/HomePage';
import { TicketList } from '../components/tickets/TicketList';
import { CustomerList } from '../components/CustomerList';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { SettingsPage } from '../components/settings/SettingsPage';
import { HelpCenter } from '../components/help/HelpCenter';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { TicketDetail } from '../components/tickets/TicketDetail';
import { TeamPage } from '../components/teams/TeamPage';
import { AgentsPage } from '../components/agents/AgentsPage';
import { useAuth } from '../hooks/useAuth';

function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${user.user_metadata.role}/dashboard`} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
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
            path: 'help',
            element: <HelpCenter />,
          },
          {
            path: 'agents',
            element: <AgentsPage />,
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