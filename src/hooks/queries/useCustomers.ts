import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../useAuth'

export const useCustomers = () => {
  const { userData } = useAuth()

  return useQuery({
    queryKey: ['customers', userData?.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, phone_number')
        .eq('company_id', userData?.company_id)
        .eq('role', 'customer')
        .order('first_name', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!userData?.company_id,
  })
} 