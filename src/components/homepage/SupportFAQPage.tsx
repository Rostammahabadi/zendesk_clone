"use client"

import { useState } from "react"
import { ThemeProvider } from "./theme-provider"
import Header from "./Header"
import Footer from "./Footer"
import LoginCTA from "./LoginCTA"
import Dashboard from "./Dashboard"
import FAQSection from "./FAQSection"
import SearchBar from "./SearchBar"
import ChatBot from "./ChatBot"

export default function SupportFAQPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#1A1A1D] text-[#E0E0E0] flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {!isLoggedIn ? <LoginCTA onLogin={() => setIsLoggedIn(true)} /> : <Dashboard />}
          <SearchBar />
          <FAQSection />
          <ChatBot />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
