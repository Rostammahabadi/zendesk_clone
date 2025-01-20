import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

export const DashboardLayout = () => {
  const [currentView, setCurrentView] = useState('home');
  const location = useLocation();

  // Keep currentView in sync with URL
  useEffect(() => {
    const path = location.pathname.substring(1) || 'home';
    setCurrentView(path);
  }, [location]);

  return (
    <div className="flex w-full h-screen bg-gray-50">
      <Sidebar
        onNavigate={(view) => setCurrentView(view)}
        currentView={currentView}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}; 