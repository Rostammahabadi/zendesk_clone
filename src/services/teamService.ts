import { supabase } from '../lib/supabaseClient';

export const teamService = {
  async fetchTeams(companyId: string) {
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
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return teams;
  },

  async fetchTeamUserGroups(companyId: string) {
    const { data: teamUserGroups, error } = await supabase
      .from('team_user_groups')
      .select('*')
      .eq('company_id', companyId);

    if (error) throw error;
    return teamUserGroups;
  },

  async createTeam(name: string, companyId: string, createdBy: string) {
    const { data, error } = await supabase
      .from('teams')
      .insert({ name, company_id: companyId, created_by: createdBy })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}; 