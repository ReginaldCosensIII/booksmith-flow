import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type WorldNote = Tables<'world_notes'>;
export type CreateWorldNote = TablesInsert<'world_notes'>;
export type UpdateWorldNote = TablesUpdate<'world_notes'>;

export const worldbuildingService = {
  async getWorldNotesByProject(projectId: string): Promise<WorldNote[]> {
    const { data, error } = await supabase
      .from('world_notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch world notes: ${error.message}`);
    }

    return data || [];
  },

  async getWorldNote(noteId: string): Promise<WorldNote | null> {
    const { data, error } = await supabase
      .from('world_notes')
      .select('*')
      .eq('id', noteId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch world note: ${error.message}`);
    }

    return data;
  },

  async createWorldNote(note: CreateWorldNote): Promise<WorldNote> {
    const { data, error } = await supabase
      .from('world_notes')
      .insert(note)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create world note: ${error.message}`);
    }

    return data;
  },

  async updateWorldNote(noteId: string, updates: UpdateWorldNote): Promise<WorldNote> {
    const { data, error } = await supabase
      .from('world_notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update world note: ${error.message}`);
    }

    return data;
  },

  async deleteWorldNote(noteId: string): Promise<void> {
    const { error } = await supabase
      .from('world_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      throw new Error(`Failed to delete world note: ${error.message}`);
    }
  },
};