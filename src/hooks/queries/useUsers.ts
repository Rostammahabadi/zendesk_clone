import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { Agent } from '../../types/user';
import { useAuth } from '../useAuth';
import { User } from '../../types/ticket';

export const useAgents = () => {
  const { userData } = useAuth();
  
  return useQuery({
    queryKey: ['agents', userData?.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'agent')
        .eq('company_id', userData?.company_id);

      if (error) throw error;
      return data as Agent[];
    },
    enabled: !!userData?.company_id,
  });
};

export const useCompanyUsers = () => {
  const { userData } = useAuth();
  
  return useQuery({
    queryKey: ['users', userData?.company_id],
    queryFn: async () => {
      if (!userData?.company_id) {
        throw new Error('No company ID available');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', userData.company_id);

      if (error) throw error;
      return data.map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        company_id: user.company_id,
        title: user.title,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
      })) as User[];
    },
    enabled: !!userData?.company_id,
  });
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: Partial<Agent> }) => {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', data.id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}; 