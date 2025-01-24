import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"

export default function Header() {
  return (
    <header className="sticky top-0 bg-[#1A1A1D] border-b border-[#333533] z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-[#9B5DE5]">
          Medicare Support
        </Link>
        <nav>
          <Button variant="ghost" className="text-[#E0E0E0] hover:text-[#9B5DE5]">
            Home
          </Button>
          <Button variant="ghost" className="text-[#E0E0E0] hover:text-[#9B5DE5]">
            Coverage
          </Button>
          <Button variant="ghost" className="text-[#E0E0E0] hover:text-[#9B5DE5]">
            Plans
          </Button>
        </nav>
      </div>
    </header>
  )
}
