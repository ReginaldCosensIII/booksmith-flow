import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Image generation request received');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    const { prompt, style, projectId } = await req.json();
    
    if (!prompt || !style) {
      console.error('Missing required fields:', { prompt: !!prompt, style: !!style });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: prompt and style are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating image with prompt:', prompt, 'style:', style);

    // Create enhanced prompt based on style
    const stylePrompts = {
      fantasy: 'fantasy book cover art, mystical and magical, epic fantasy style',
      'sci-fi': 'science fiction book cover art, futuristic and technological, sci-fi style',
      mystery: 'mystery book cover art, dark and suspenseful, noir style',
      romance: 'romance book cover art, romantic and emotional, elegant style',
      literary: 'literary fiction book cover art, artistic and sophisticated, minimalist style',
      minimalist: 'minimalist book cover design, clean and simple, modern typography'
    };

    const enhancedPrompt = `${prompt}, ${stylePrompts[style as keyof typeof stylePrompts] || ''}, book cover, professional design, high quality, 1024x1536 aspect ratio`;

    console.log('Enhanced prompt:', enhancedPrompt);

    // Generate image using OpenAI
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const imageUrl = data.data[0].url;
    
    // Download the image from OpenAI's URL
    console.log('Downloading image from OpenAI URL:', imageUrl);
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }
    
    const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());
    const fileName = `cover_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    
    console.log('Uploading image to storage:', fileName);
    
    // Upload to Supabase Storage
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('covers')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    console.log('Image uploaded successfully:', uploadData.path);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('covers')
      .getPublicUrl(fileName);

    const publicImageUrl = publicUrlData.publicUrl;
    console.log('Public URL generated:', publicImageUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: publicImageUrl,
        prompt,
        style,
        fileName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});