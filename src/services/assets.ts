import { supabase } from "@/integrations/supabase/client";

export interface Asset {
  id: string;
  project_id: string;
  type: string;
  url: string;
  prompt?: string;
  created_at: string;
}

export const assetsService = {
  async getAssetsByProject(projectId: string): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }

    return data || [];
  },

  async createAsset(asset: Omit<Asset, 'id' | 'created_at'>): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .insert([asset])
      .select()
      .single();

    if (error) {
      console.error('Error creating asset:', error);
      throw error;
    }

    return data;
  },

  async deleteAsset(id: string): Promise<void> {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  }
};