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
        })
        .select()
        .single();

      if (teamError) throw teamError;

      if (memberIds.length > 0) {
        // Then create user_team relationships
        const { error: membersError } = await supabase
          .from('user_teams')
          .insert(
            memberIds.map(userId => ({
              team_id: team.id,
              user_id: userId,
              assigned_by: userData?.id,
              assigned_at: new Date().toISOString()
            }))
          );

        if (membersError) throw membersError;
      }

      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teamUserGroups'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  return useMutation({
    mutationFn: async ({ teamId, name }: { teamId: string; name: string }) => {
      if (!userData?.company_id) throw new Error('Company ID is required');
      
      const { error } = await supabase
        .from('teams')
        .update({ name })
        .eq('id', teamId)
        .eq('company_id', userData.company_id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate both teams and teamUserGroups queries to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teamUserGroups'] });
    }
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  return useMutation({
    mutationFn: async (teamId: string) => {
      if (!userData?.company_id) throw new Error('Company ID is required');
      
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)
        .eq('company_id', userData.company_id);

      if (error) throw error;
      return teamId;
    },
    onSuccess: () => {
      // Invalidate both queries to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teamUserGroups'] });
    }
  });
};

export const useTeamUserGroups = () => {
  const { userData } = useAuth();
  
  return useQuery({
    queryKey: ['teamUserGroups', userData?.company_id],
    queryFn: async () => {
      if (!userData?.company_id) throw new Error('Company ID is required');

      const { data: teamUserGroups, error } = await supabase
        .rpc('get_team_stats', {
          days_ago: 30,
          p_company_id: userData.company_id
        });
      if (error) throw error;

      // Transform the data to filter out null values from users array
      return teamUserGroups?.map((group: any) => ({
        ...group,
        users: group.users?.filter((user: any) => user !== null) || []
      })) || [];
    },
    enabled: !!userData?.company_id,
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      if (!userData?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_teams')
        .insert({
          user_id: userId,
          team_id: teamId,
          assigned_by: userData.id,
          assigned_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamUserGroups'] });
    }
  });
}; 