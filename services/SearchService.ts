export interface SearchSuggestion {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  image_url: string | null;
  nav_node_id: string | null;
  category_name: string | null;
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || !query.trim()) return [];
  
  try {
    const { getSupabaseClient } = await import('@/lib/supabase/client');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseClient() as any;
    
    const { data, error } = await supabase.rpc('get_search_suggestions', {
      p_query: query.trim()
    });

    if (error) {
      console.error('[SearchService] getSearchSuggestions error:', error.message);
      return [];
    }

    return (data || []) as SearchSuggestion[];
  } catch (err) {
    console.error('[SearchService] Failed to fetch suggestions:', err);
    return [];
  }
}
