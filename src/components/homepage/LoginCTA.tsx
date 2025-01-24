import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom"

interface LoginCTAProps {
  onLogin: () => void
}

export default function LoginCTA({ onLogin }: LoginCTAProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
    onLogin();
  };

  return (
    <div className="bg-[#333533] p-8 rounded-lg mb-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Log In to Open a Ticket</h2>
      <p className="mb-4">Access your support tickets and manage your Medicare inquiries.</p>
      <Button onClick={handleLogin} className="bg-[#9B5DE5] hover:bg-[#6A4C93] text-white">
        Log In
      </Button>
    </div>
  )
}
