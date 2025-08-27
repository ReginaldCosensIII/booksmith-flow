import { supabase } from "@/integrations/supabase/client";

// AI Service for writing assistance and image generation
export interface AIWritingOptions {
  currentContent: string;
  chapterTitle?: string;
  projectGenre?: string;
  wordTarget?: number;
  style?: 'continue' | 'rewrite' | 'brainstorm' | 'outline';
}

export interface AIResponse {
  content: string;
  suggestions?: string[];
  tokens_used?: number;
}

export interface AskAIParams {
  system?: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_output_tokens?: number;
}

export interface GenerateCoverParams {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  n?: number;
  quality?: "standard" | "hd";
}

// Core AI functions using edge functions
export async function askAI(params: AskAIParams): Promise<string> {
  const { data, error } = await supabase.functions.invoke("openai-text", {
    body: params
  });

  if (error) {
    console.error('Error calling openai-text function:', error);
    throw new Error(`AI request failed: ${error.message}`);
  }

  if (!data?.text) {
    throw new Error('No text response received from AI');
  }

  return data.text;
}

export async function generateCover(params: GenerateCoverParams): Promise<{images: string[]}> {
  const { data, error } = await supabase.functions.invoke("openai-image", {
    body: params
  });

  if (error) {
    console.error('Error calling openai-image function:', error);
    throw new Error(`Image generation failed: ${error.message}`);
  }

  if (!data?.images || !Array.isArray(data.images)) {
    throw new Error('No images received from AI');
  }

  return { images: data.images };
}

// Legacy AI service for writing assistance (using new askAI function)
export const aiService = {
  async continueWriting(options: AIWritingOptions): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a creative writing assistant. Help continue the story based on the current content. ${options.projectGenre ? `The genre is: ${options.projectGenre}.` : ''} ${options.wordTarget ? `Target about ${options.wordTarget} words.` : ''}`;
      
      const content = await askAI({
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Continue this story from where it left off: "${options.currentContent}"\n\nChapter title: ${options.chapterTitle || 'Untitled'}`
        }],
        temperature: 0.8,
        max_output_tokens: options.wordTarget || 400
      });

      return {
        content,
        suggestions: [
          "Review the AI's continuation for consistency",
          "Consider adjusting the tone if needed",
          "Feel free to edit and make it your own"
        ],
        tokens_used: content.split(' ').length
      };
    } catch (error) {
      console.error('Error in continueWriting:', error);
      throw new Error('Failed to generate story continuation');
    }
  },

  async rewriteContent(options: AIWritingOptions): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a creative writing assistant specializing in content revision. Rewrite the provided text to improve clarity, flow, and engagement while maintaining the original meaning and voice. ${options.projectGenre ? `The genre is: ${options.projectGenre}.` : ''}`;
      
      const content = await askAI({
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Please rewrite this text to improve it: "${options.currentContent}"`
        }],
        temperature: 0.6,
        max_output_tokens: Math.max(options.currentContent.split(' ').length * 1.2, 200)
      });

      return {
        content,
        suggestions: [
          "Compare with the original to ensure key points remain",
          "The AI focused on improving flow and clarity",
          "Feel free to blend elements from both versions"
        ],
        tokens_used: content.split(' ').length
      };
    } catch (error) {
      console.error('Error in rewriteContent:', error);
      throw new Error('Failed to rewrite content');
    }
  },

  async brainstormIdeas(options: AIWritingOptions): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a creative writing assistant specializing in brainstorming. Generate creative ideas and suggestions based on the current story context. ${options.projectGenre ? `The genre is: ${options.projectGenre}.` : ''}`;
      
      const content = await askAI({
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Based on this story context: "${options.currentContent}"\n\nChapter: ${options.chapterTitle || 'Untitled'}\n\nGenerate 5-7 creative ideas for where the story could go next, including plot developments, character moments, or scene ideas.`
        }],
        temperature: 0.9,
        max_output_tokens: 500
      });

      return {
        content,
        suggestions: [
          "Pick the ideas that best fit your story vision",
          "Consider how each idea affects your overall plot",
          "Feel free to combine or modify these suggestions"
        ],
        tokens_used: content.split(' ').length
      };
    } catch (error) {
      console.error('Error in brainstormIdeas:', error);
      throw new Error('Failed to generate brainstorming ideas');
    }
  },

  async generateOutline(options: AIWritingOptions): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a creative writing assistant specializing in story structure and outlining. Create a detailed outline for the next part of the story. ${options.projectGenre ? `The genre is: ${options.projectGenre}.` : ''}`;
      
      const content = await askAI({
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Based on the current story: "${options.currentContent}"\n\nChapter: ${options.chapterTitle || 'Untitled'}\n\nCreate a detailed outline for how this chapter or the next chapter could be structured, including key scenes, character moments, and plot points.`
        }],
        temperature: 0.7,
        max_output_tokens: 600
      });

      return {
        content,
        suggestions: [
          "Use this outline as a flexible guide",
          "Adapt the structure to fit your writing style",
          "Consider pacing and character development"
        ],
        tokens_used: content.split(' ').length
      };
    } catch (error) {
      console.error('Error in generateOutline:', error);
      throw new Error('Failed to generate outline');
    }
  }
};