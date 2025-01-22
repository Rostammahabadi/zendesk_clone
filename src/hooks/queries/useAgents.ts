import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../useAuth';
import { Agent } from '../../types/user';

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

export const useAgent = (agentId: string) => {
  return useQuery({
    queryKey: ['agents', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', agentId)
        .single();

      if (error) throw error;
      return data as Agent;
    },
    enabled: !!agentId,
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agent: Agent) => await supabase.from('users').insert(agent),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agent: Agent) => await supabase.from('users').update(agent).eq('id', agent.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  });
};


export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agentId: string) => await supabase.from('users').delete().eq('id', agentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  });
};
