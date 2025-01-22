import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../useAuth';

export const useTeams = () => {
  const { userData } = useAuth();
  
  return useQuery({
    queryKey: ['teams', userData?.company_id],
    queryFn: async () => {
      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          created_at,
          created_by,
          company_id,
          user_teams (
            user: users (
              id,
              email,
              first_name,
              last_name,
              role
            )
          )
        `)
        .eq('company_id', userData?.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return teams;
    },
    enabled: !!userData?.company_id,
  });
};

export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: async () => {
      const { data: team, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          created_at,
          created_by,
          company_id,
          user_teams (
            user: users (
              id,
              email,
              first_name,
              last_name,
              role
            )
          )
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return team;
    },
    enabled: !!teamId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  return useMutation({
    mutationFn: async ({ name, memberIds }: { name: string; memberIds: string[] }) => {
      // First create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({ 
          name, 
          company_id: userData?.company_id,
          created_by: userData?.id 
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Then create user_team relationships
      const userTeams = memberIds.map(userId => ({
        team_id: team.id,
        user_id: userId,
        assigned_by: userData?.id,
      }));

      const { error: membersError } = await supabase
        .from('user_teams')
        .insert(userTeams);

      if (membersError) throw membersError;

      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      teamId, 
      data 
    }: { 
      teamId: string; 
      data: { name?: string; memberIds?: string[] } 
    }) => {

      if (data.name) {
        const { error: nameError } = await supabase
          .from('teams')
          .update({ name: data.name })
          .eq('id', teamId);

        if (nameError) throw nameError;
      }

      if (data.memberIds) {
        // First remove all existing members
        const { error: deleteError } = await supabase
          .from('user_teams')
          .delete()
          .eq('team_id', teamId);

        if (deleteError) throw deleteError;

        // Then add new members
        const { error: membersError } = await supabase
          .from('user_teams')
          .insert(
            data.memberIds.map(userId => ({
              team_id: teamId,
              user_id: userId,
            }))
          );

        if (membersError) throw membersError;
      }

      return { id: teamId, ...data };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', data.id] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      return teamId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}; 