import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Character = Tables<'characters'>;
export type CreateCharacter = TablesInsert<'characters'>;
export type UpdateCharacter = TablesUpdate<'characters'>;

export const charactersService = {
  async getCharactersByProject(projectId: string): Promise<Character[]> {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch characters: ${error.message}`);
    }

    return data || [];
  },

  async getCharacter(characterId: string): Promise<Character | null> {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch character: ${error.message}`);
    }

    return data;
  },

  async createCharacter(character: CreateCharacter): Promise<Character> {
    const { data, error } = await supabase
      .from('characters')
      .insert(character)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create character: ${error.message}`);
    }

    return data;
  },

  async updateCharacter(characterId: string, updates: UpdateCharacter): Promise<Character> {
    const { data, error } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', characterId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update character: ${error.message}`);
    }

    return data;
  },

  async deleteCharacter(characterId: string): Promise<void> {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId);

    if (error) {
      throw new Error(`Failed to delete character: ${error.message}`);
    }
  },
};