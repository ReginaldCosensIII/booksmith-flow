import { supabase } from '@/integrations/supabase/client';

export interface GenerateImageRequest {
  prompt: string;
  style: string;
  projectId?: string;
}

export interface GeneratedImage {
  success: boolean;
  imageUrl: string;
  prompt: string;
  style: string;
  fileName: string;
}

export const imageGenerationService = {
  async generateCover(request: GenerateImageRequest): Promise<GeneratedImage> {
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: request
    });

    if (error) {
      throw new Error(`Image generation failed: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.details || 'Image generation failed');
    }

    return data;
  }
};