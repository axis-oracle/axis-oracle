import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Launch {
  id: string;
  name: string;
  net: string;
  status: {
    id: number;
    name: string;
    abbrev: string;
  };
  rocket: {
    configuration: {
      name: string;
      family: string;
    };
  };
  pad: {
    name: string;
    location: {
      name: string;
      country_code: string;
    };
  };
  mission?: {
    name: string;
    description: string;
    type: string;
  };
  launch_service_provider: {
    name: string;
    abbrev: string;
  };
  image?: string;
}

interface LaunchResponse {
  count: number;
  results: Launch[];
}

// Simple in-memory cache
let cachedData: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    
    // Check cache
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      console.log('Returning cached launch data');
      return new Response(JSON.stringify(cachedData.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching fresh launch data from Launch Library 2');
    
    // Fetch upcoming launches (next 30 days)
    const response = await fetch(
      'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=50&mode=detailed',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Launch Library API error: ${response.status}`);
      throw new Error(`API returned ${response.status}`);
    }

    const data: LaunchResponse = await response.json();
    
    // Transform data for frontend
    const launches = data.results.map((launch) => ({
      id: launch.id,
      name: launch.name,
      net: launch.net, // NET = No Earlier Than (launch time)
      status: {
        id: launch.status.id,
        name: launch.status.name,
        abbrev: launch.status.abbrev,
      },
      rocket: launch.rocket?.configuration?.name || 'Unknown Rocket',
      rocketFamily: launch.rocket?.configuration?.family || '',
      pad: launch.pad?.name || 'Unknown Pad',
      location: launch.pad?.location?.name || 'Unknown Location',
      country: launch.pad?.location?.country_code || '',
      provider: launch.launch_service_provider?.name || 'Unknown Provider',
      providerAbbrev: launch.launch_service_provider?.abbrev || '',
      mission: launch.mission?.name || null,
      missionType: launch.mission?.type || null,
      image: launch.image || null,
    }));

    const result = {
      count: launches.length,
      launches,
      fetchedAt: new Date().toISOString(),
    };

    // Update cache
    cachedData = { data: result, timestamp: now };

    console.log(`Successfully fetched ${launches.length} upcoming launches`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching launches:', error);
    
    // Return cached data if available, even if stale
    if (cachedData) {
      console.log('Returning stale cached data due to error');
      return new Response(JSON.stringify({ ...cachedData.data, stale: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to fetch launch data', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
