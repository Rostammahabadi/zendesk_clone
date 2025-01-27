import { AdminHomePage } from "./AdminHomePage.tsx";
import { CustomerHomePage } from "./CustomerHomePage.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import { AgentHomePage } from "./AgentHomePage.tsx";

export function HomePage() {
  const { user } = useAuth();

  // If user is not logged in, show loading or redirect
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Get role from user metadata
  const userRole = user.user_metadata?.role;

  // Render appropriate page based on role
  switch (userRole) {
    case 'admin':
      return <AdminHomePage />;
    case 'agent':
      return <AgentHomePage />; // For now using CustomerHomePage for agents too
    case 'customer':
      return <CustomerHomePage />;
    default:
      return <CustomerHomePage />; // Fallback to customer page
  }
}
