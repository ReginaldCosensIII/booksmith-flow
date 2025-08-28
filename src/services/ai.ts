// AI Service for writing assistance
// Now integrated with OpenAI via Supabase Edge Function

import { supabase } from '@/integrations/supabase/client';

export interface AIWritingOptions {
  currentContent: string;
  chapterTitle?: string;
  projectGenre?: string;
  wordTarget?: number;
  style?: 'continue' | 'rewrite' | 'brainstorm' | 'outline';
  customInstructions?: string;
}

export interface AIResponse {
  content: string;
  suggestions?: string[];
  tokens_used?: number;
}

export const aiService = {
  // Writing assistance functions
  async continueWriting(options: AIWritingOptions): Promise<AIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-writing-assistant', {
        body: {
          action: 'continue',
          currentContent: options.currentContent,
          chapterTitle: options.chapterTitle,
          projectGenre: options.projectGenre,
          customInstructions: options.customInstructions
        }
      });

      if (error) {
        console.error('AI Service Error:', error);
        throw new Error(error.message || 'Failed to generate content');
      }

      return {
        content: data.content,
        suggestions: data.suggestions || [],
        tokens_used: data.tokens_used || 0
      };
    } catch (error) {
      console.error('Continue writing error:', error);
      throw error;
    }
  },

  async rewriteContent(options: AIWritingOptions): Promise<AIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-writing-assistant', {
        body: {
          action: 'rewrite',
          currentContent: options.currentContent,
          chapterTitle: options.chapterTitle,
          projectGenre: options.projectGenre,
          customInstructions: options.customInstructions
        }
      });

      if (error) {
        console.error('AI Service Error:', error);
        throw new Error(error.message || 'Failed to rewrite content');
      }

      return {
        content: data.content,
        suggestions: data.suggestions || [],
        tokens_used: data.tokens_used || 0
      };
    } catch (error) {
      console.error('Rewrite content error:', error);
      throw error;
    }
  },

  async brainstormIdeas(options: AIWritingOptions): Promise<AIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-writing-assistant', {
        body: {
          action: 'brainstorm',
          currentContent: options.currentContent,
          chapterTitle: options.chapterTitle,
          projectGenre: options.projectGenre,
          customInstructions: options.customInstructions
        }
      });

      if (error) {
        console.error('AI Service Error:', error);
        throw new Error(error.message || 'Failed to brainstorm ideas');
      }

      return {
        content: data.content,
        suggestions: data.suggestions || [],
        tokens_used: data.tokens_used || 0
      };
    } catch (error) {
      console.error('Brainstorm ideas error:', error);
      throw error;
    }
  },

  async generateOutline(options: AIWritingOptions): Promise<AIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-writing-assistant', {
        body: {
          action: 'outline',
          currentContent: options.currentContent,
          chapterTitle: options.chapterTitle,
          projectGenre: options.projectGenre,
          customInstructions: options.customInstructions
        }
      });

      if (error) {
        console.error('AI Service Error:', error);
        throw new Error(error.message || 'Failed to generate outline');
      }

      return {
        content: data.content,
        suggestions: data.suggestions || [],
        tokens_used: data.tokens_used || 0
      };
    } catch (error) {
      console.error('Generate outline error:', error);
      throw error;
    }
  }
};