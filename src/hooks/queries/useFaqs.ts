import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';

export const useFaqs = () => {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('faqs').select('*').eq('published', true);
      if (error) throw error;
      return data;
    },
  });
}; 