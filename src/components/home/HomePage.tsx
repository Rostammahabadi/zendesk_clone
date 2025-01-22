import { AdminHomePage } from "./AdminHomePage";
import { CustomerHomePage } from "./CustomerHomePage";
import { useAuth } from "../../hooks/useAuth";

export function HomePage() {
  const { user } = useAuth();

  // If user is not logged in, you might want to redirect or show a loading state
  if (!user) return null;

  // If user is admin, render AdminHomePage
  if (user.user_metadata.role === 'admin') {
    return <AdminHomePage />;
  }

  // For all other roles (customer, agent, etc.), render CustomerHomePage
  return <CustomerHomePage />;
}
