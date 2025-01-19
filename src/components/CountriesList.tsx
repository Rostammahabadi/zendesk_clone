import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface Country {
  name: string;
}

export const CountriesList = () => {
  const navigate = useNavigate()
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getCountries = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("countries").select()
        if (error) throw error
        setCountries(data || [])
      } catch (error) {
        setError('Failed to load countries')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    getCountries()
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Countries List</h1>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
      
      <ul className="space-y-2">
        {countries.map((country: Country) => (
          <li key={country.name} className="p-2 bg-white rounded shadow">
            {country.name}
          </li>
        ))}
      </ul>
    </div>
  )
} 