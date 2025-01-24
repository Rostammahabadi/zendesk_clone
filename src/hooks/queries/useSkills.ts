import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../useAuth';

export interface Skill {
  id: number;
  company_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useSkills = () => {
  const { userData } = useAuth();

  return useQuery({
    queryKey: ['skills', userData?.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('company_id', userData?.company_id)
        .order('name');

      if (error) throw error;
      return data as Skill[];
    },
    enabled: !!userData?.company_id,
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('skills')
        .insert({
          name,
          company_id: userData?.company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skillId: number) => {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};
