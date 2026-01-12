import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_API_BASE = 'https://api.themoviedb.org/3';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TMDB_API_KEY');
    if (!apiKey) {
      throw new Error('TMDB_API_KEY not configured');
    }

    const { query, mode = 'all' } = await req.json();
    
    let searchUrl: string;
    const today = new Date().toISOString().split('T')[0];
    
    if (mode === 'upcoming') {
      // Fetch upcoming movies (release date in the future)
      console.log(`Fetching upcoming movies from ${today}`);
      searchUrl = `${TMDB_API_BASE}/discover/movie?api_key=${apiKey}&release_date.gte=${today}&sort_by=popularity.desc&include_adult=false&language=en-US&page=1`;
    } else if (query && query.trim().length >= 2) {
      // Regular search
      console.log(`Searching TMDB for: ${query}`);
      searchUrl = `${TMDB_API_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
    } else if (mode === 'upcoming') {
      // Already handled above
      searchUrl = `${TMDB_API_BASE}/discover/movie?api_key=${apiKey}&release_date.gte=${today}&sort_by=popularity.desc&include_adult=false&language=en-US&page=1`;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Query must be at least 2 characters for search mode', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Map results to simplified format
    const results = (data.results || []).slice(0, 10).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      overview: movie.overview?.substring(0, 150),
    }));

    console.log(`Found ${results.length} movies`);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('TMDB search error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message, results: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
