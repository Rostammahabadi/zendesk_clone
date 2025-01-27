import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1D] border-t border-[#333533]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            <p>Phone: 1-800-ASSISTLY</p>
            <p>Email: support@assistly.gov</p>
          </div>
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Legal</h3>
            <ul>
              <li>
                <Link to="/privacy" className="hover:text-[#9B5DE5]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#9B5DE5]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-[#9B5DE5]">
                  Disclaimers
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h3 className="text-lg font-semibold mb-2">Connect With Us</h3>
            <div className="flex space-x-4">{/* Add social media icons here */}</div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-[#A9A9A9]">
          {new Date().getFullYear()} Assistly. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
