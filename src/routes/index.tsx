import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../components/LoginPage';
import { AuthCallback } from '../components/AuthCallback';
import { ProtectedRoute } from './ProtectedRoute';
import { CountriesList } from '../components/CountriesList';

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
        index: true,
        element: <CountriesList />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true
  }
}); 