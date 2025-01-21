import { supabase } from '../lib/supabaseClient';
import { Agent } from '../types/user';


export const userService = {
  async fetchAgents() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agent');

    if (error) throw error;

    return data as Agent[];
  }
}