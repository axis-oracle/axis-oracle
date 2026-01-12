import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.24.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * AI Resolution Edge Function
 * 
 * Uses Claude to analyze and resolve AI-powered oracle questions.
 * Supports various modules: politics, economy, awards, legal, custom predictions
 */

interface ResolutionRequest {
  feedId: string;
  module: string;
  question: string;
  config: Record<string, any>;
}

interface ResolutionResponse {
  success: boolean;
  outcome: string; // '1' for YES/True, '0' for NO/False, or specific value
  confidence: number; // 0-100
  reasoning: string;
  sources: string[];
  error?: string;
}

// System prompts for different modules
const MODULE_PROMPTS: Record<string, string> = {
  politics: `You are an expert political analyst oracle. Your task is to determine the factual outcome of political events.
You must analyze:
- Official election results from government sources
- Legislation voting records
- Political appointments and resignations
- Verified news from reputable sources

Return ONLY factual outcomes that have already occurred. If the event hasn't happened yet, return outcome: "pending".
For binary questions (Yes/No), return "1" for Yes/True, "0" for No/False.
For winner questions, return the winner's name or identifier.`,

  economy: `You are an expert economic analyst oracle. Your task is to determine economic data and Fed decisions.
You must analyze:
- Federal Reserve announcements and FOMC decisions
- Official government statistics (BLS, BEA)
- CPI, GDP, unemployment data from official sources

Return ONLY factual data that has been officially released. If data isn't available yet, return outcome: "pending".
For rate decisions: "raise", "cut", or "hold".
For numeric data: return the exact value.`,

  awards: `You are an expert entertainment analyst oracle. Your task is to determine award show winners.
You must analyze:
- Official award show announcements
- Verified winner lists from Academy, Recording Academy, etc.

Return ONLY officially announced winners. If the ceremony hasn't happened, return outcome: "pending".
Return the winner's name exactly as announced.`,

  legal: `You are an expert legal analyst oracle. Your task is to determine court case outcomes.
You must analyze:
- Official court rulings and decisions
- Settlement announcements
- Case dismissals

Return ONLY final, official rulings. If the case is still pending, return outcome: "pending".
For verdicts: "guilty", "not_guilty", "settled", "dismissed".
For SEC cases: "plaintiff" (SEC wins), "defendant" (company wins).`,

  custom: `You are an AI oracle for custom predictions. Your task is to determine if a specific condition or event has occurred.
Analyze all available information from web searches and news to determine the factual outcome.

Return ONLY factual outcomes that have already occurred. If the event hasn't happened yet, return outcome: "pending".
For binary questions (Yes/No), return "1" for Yes/True, "0" for No/False.`,
};

async function resolveWithAI(
  client: Anthropic,
  module: string,
  question: string,
  config: Record<string, any>
): Promise<ResolutionResponse> {
  const systemPrompt = MODULE_PROMPTS[module] || MODULE_PROMPTS.custom;
  
  // Build context based on module
  let context = '';
  
  if (module === 'politics') {
    context = `
Event Type: ${config.eventType || 'general'}
Region: ${config.region || 'global'}
Specific Question: ${question}
Resolution Deadline: ${config.resolutionDate}
Additional Context: ${config.additionalContext || 'None'}`;
  } else if (module === 'economy') {
    context = `
Economic Indicator: ${config.indicator || 'general'}
Data Source: ${config.dataSource || 'official'}
Period: ${config.period || 'latest'}
Specific Question: ${question}
Expected Date: ${config.expectedDate || config.resolutionDate}`;
  } else if (module === 'awards') {
    context = `
Award Show: ${config.awardShow || 'general'}
Category: ${config.category || 'general'}
Year: ${config.year || new Date().getFullYear()}
Specific Question: ${question}
Ceremony Date: ${config.ceremonyDate || 'TBD'}`;
  } else if (module === 'legal') {
    context = `
Case Name: ${config.caseName || 'Unknown'}
Court: ${config.court || 'Unknown'}
Case Type: ${config.caseType || 'general'}
Parties: ${config.parties || 'Unknown'}
Specific Question: ${question}`;
  } else {
    context = `
Question: ${question}
Resolution Deadline: ${config.resolutionDate}
Additional Context: ${config.additionalContext || 'None'}
Sources to check: ${config.sources?.join(', ') || 'Web search, news'}`;
  }

  const userMessage = `
Current Date: ${new Date().toISOString()}

Context:
${context}

Please analyze this question and provide a resolution. If the event/data is not yet available, indicate that it's pending.

Respond in JSON format:
{
  "outcome": "1 or 0 for binary, or specific value/name",
  "confidence": 0-100,
  "reasoning": "Brief explanation of how you determined the outcome",
  "sources": ["list of sources used"],
  "status": "resolved" or "pending"
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ],
    });

    // Extract text content
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Claude response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      success: true,
      outcome: parsed.status === 'pending' ? 'pending' : parsed.outcome,
      confidence: parsed.confidence || 0,
      reasoning: parsed.reasoning || '',
      sources: parsed.sources || [],
    };
  } catch (error: any) {
    console.error('Claude API error:', error);
    return {
      success: false,
      outcome: 'error',
      confidence: 0,
      reasoning: '',
      sources: [],
      error: error.message,
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const client = new Anthropic({ apiKey: anthropicApiKey });
    
    const body = await req.json() as ResolutionRequest;
    const { feedId, module, question, config } = body;

    console.log(`AI Resolution request for feed ${feedId}, module: ${module}`);
    console.log(`Question: ${question}`);

    const result = await resolveWithAI(client, module, question, config);

    console.log(`AI Resolution result:`, JSON.stringify(result));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('AI Resolution error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
