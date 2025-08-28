import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  action: 'continue' | 'rewrite' | 'brainstorm' | 'outline';
  currentContent: string;
  chapterTitle?: string;
  projectGenre?: string;
  wordTarget?: number;
  customInstructions?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { action, currentContent, chapterTitle, projectGenre, customInstructions }: AIRequest = await req.json();

    if (!action) {
      throw new Error('Action is required');
    }

    // Prepare system message based on action
    let systemMessage = '';
    let userMessage = '';

    switch (action) {
      case 'continue':
        systemMessage = `You are a creative writing assistant helping an author continue their story. 
        Maintain the existing tone, style, and narrative voice. Write in a way that flows naturally from the provided content.
        ${projectGenre ? `The genre is ${projectGenre}.` : ''}
        ${chapterTitle ? `This is from a chapter titled "${chapterTitle}".` : ''}
        Provide 2-3 paragraphs that continue the story naturally.`;
        
        userMessage = customInstructions || 
          `Continue this story from where it left off:\n\n${currentContent.slice(-1000)}`;
        break;

      case 'rewrite':
        systemMessage = `You are a skilled editor helping improve a piece of writing. 
        Rewrite the provided content to improve clarity, flow, and engagement while maintaining the original meaning and voice.
        ${projectGenre ? `The genre is ${projectGenre}.` : ''}
        Focus on enhancing sentence structure, word choice, and narrative flow.`;
        
        userMessage = customInstructions || 
          `Please rewrite this content to improve it:\n\n${currentContent.slice(-1000)}`;
        break;

      case 'brainstorm':
        systemMessage = `You are a creative writing coach helping an author brainstorm ideas. 
        Generate creative, specific, and actionable ideas that fit the story context.
        ${projectGenre ? `The genre is ${projectGenre}.` : ''}
        ${chapterTitle ? `This is for a chapter titled "${chapterTitle}".` : ''}
        Provide 5-7 concrete ideas that could enhance the story.`;
        
        userMessage = customInstructions || 
          `Based on this story context, help me brainstorm ideas for what could happen next:\n\n${currentContent.slice(-500)}`;
        break;

      case 'outline':
        systemMessage = `You are a story structure expert helping create chapter outlines. 
        Create a clear, actionable outline that serves the story's progression.
        ${projectGenre ? `The genre is ${projectGenre}.` : ''}
        ${chapterTitle ? `This is for a chapter titled "${chapterTitle}".` : ''}
        Structure the outline with clear beats and story purposes.`;
        
        userMessage = customInstructions || 
          `Create a chapter outline based on this story context:\n\n${currentContent.slice(-500)}`;
        break;

      default:
        throw new Error('Invalid action');
    }

    console.log(`AI Writing Assistant: ${action} request for ${chapterTitle || 'untitled chapter'}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_completion_tokens: action === 'continue' ? 300 : 
                             action === 'rewrite' ? 400 : 
                             action === 'brainstorm' ? 250 : 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Generate contextual suggestions based on action
    let suggestions: string[] = [];
    
    switch (action) {
      case 'continue':
        suggestions = [
          "Consider adding dialogue to show character emotions",
          "This could be a good place to increase tension",
          "Think about how this advances your overall plot"
        ];
        break;
      case 'rewrite':
        suggestions = [
          "The revised version has improved flow and clarity",
          "Character voice is now more consistent",
          "Pacing has been enhanced for better engagement"
        ];
        break;
      case 'brainstorm':
        suggestions = [
          "Pick the idea that best serves your story's themes",
          "Consider how each idea affects character development",
          "Think about which idea creates the most compelling conflict"
        ];
        break;
      case 'outline':
        suggestions = [
          "Adapt this structure to your specific story needs",
          "Each section should advance the main plot",
          "Consider your target chapter word count"
        ];
        break;
    }

    const result = {
      content: generatedContent,
      suggestions,
      tokens_used: data.usage?.total_tokens || 0,
      action
    };

    console.log(`AI Writing Assistant: ${action} completed, ${result.tokens_used} tokens used`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-writing-assistant function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      action: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});