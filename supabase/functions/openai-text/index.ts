import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [];
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!openAIApiKey) {
  console.error('OPENAI_API_KEY is required');
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

interface RequestBody {
  system?: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_output_tokens?: number;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: user, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.user?.id);

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: RequestBody = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Apply defaults
    const model = body.model || 'o3-mini';
    const temperature = body.temperature ?? 0.7;
    const max_output_tokens = body.max_output_tokens || 800;

    // Build OpenAI messages
    const openAIMessages = [];
    
    if (body.system) {
      openAIMessages.push({
        role: 'system',
        content: body.system
      });
    }

    openAIMessages.push(...body.messages);

    console.log('Calling OpenAI with model:', model);

    // Determine if we need max_completion_tokens or max_tokens based on model
    const isNewModel = model.startsWith('gpt-5') || 
                      model.startsWith('gpt-4.1') || 
                      model.startsWith('o3') || 
                      model.startsWith('o4');

    const requestBody: any = {
      model,
      messages: openAIMessages,
    };

    // Add token limit parameter based on model
    if (isNewModel) {
      requestBody.max_completion_tokens = max_output_tokens;
      // Don't include temperature for newer models as it's not supported
    } else {
      requestBody.max_tokens = max_output_tokens;
      requestBody.temperature = temperature;
    }

    console.log('OpenAI request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(JSON.stringify({ 
        error: 'OpenAI API error', 
        details: data 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract text content, prefer output_text if available
    const choice = data.choices?.[0];
    const message = choice?.message;
    let text = '';

    if (message?.output_text) {
      text = message.output_text;
    } else if (message?.content) {
      text = message.content;
    }

    const result = {
      text,
      raw: data
    };

    console.log('Returning result with text length:', text.length);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openai-text function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});