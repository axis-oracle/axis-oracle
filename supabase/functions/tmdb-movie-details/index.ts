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

    const { movieId } = await req.json();
    
    if (!movieId) {
      return new Response(
        JSON.stringify({ success: false, error: 'movieId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching TMDB details for movie: ${movieId}`);

    const detailsUrl = `${TMDB_API_BASE}/movie/${movieId}?api_key=${apiKey}&language=en-US`;
    
    const response = await fetch(detailsUrl);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const movie = await response.json();
    
    const data = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      vote_average: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      runtime: movie.runtime,
      status: movie.status,
      revenue: movie.revenue,
      budget: movie.budget,
    };

    console.log(`Movie ${movie.title}: rating=${data.vote_average}, popularity=${data.popularity}`);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('TMDB details error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
