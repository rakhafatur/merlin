import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or ANON KEY is missing. Check your .env file!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// fetch dashboard summary
export const fetchTopMerchants = async ({
  category,
  city,
  region,
}: {
  category?: string;
  city?: string;
  region?: string;
} = {}) => {
  let query = supabase
    .from('merchant_ranking_summary')
    .select('*')
    .order('health_score', { ascending: false })
    .limit(10);

  if (category && category !== 'ALL') {
    query = query.eq('merchant_category', category);
  }
  if (city && city !== 'ALL') {
    query = query.eq('city', city);
  }
  if (region && region !== 'ALL') {
    query = query.eq('region', region);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
