import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: string;
  added_at: string;
}

export const useUserSkills = (userId: string) => {
  return useQuery({
    queryKey: ['userSkills', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_skills')
        .select(`
          *,
          skills (
            id,
            name
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useAddUserSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, skillId, proficiency = 'beginner' }: { userId: string, skillId: string, proficiency?: string }) => {
      const { data, error } = await supabase
        .from('user_skills')
        .insert({
          user_id: userId,
          skill_id: skillId,
          proficiency,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['userSkills', userId] });
    },
  });
};

export const useRemoveUserSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, skillId }: { userId: string, skillId: string }) => {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', userId)
        .eq('skill_id', skillId);

      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['userSkills', userId] });
    },
  });
};
