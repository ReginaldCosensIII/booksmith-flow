import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Asset = Tables<'assets'>;
export type CreateAsset = TablesInsert<'assets'>;

export const assetsService = {
  async getProjectAssets(projectId: string, type: string = 'cover'): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch assets: ${error.message}`);
    }

    return data || [];
  },

  async createAsset(asset: CreateAsset): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .insert(asset)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create asset: ${error.message}`);
    }

    return data;
  },

  async deleteAsset(assetId: string): Promise<void> {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);

    if (error) {
      throw new Error(`Failed to delete asset: ${error.message}`);
    }
  }
};