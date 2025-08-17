import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Chapter = Tables<'chapters'>;
export type CreateChapter = TablesInsert<'chapters'>;
export type UpdateChapter = TablesUpdate<'chapters'>;

export const chaptersService = {
  async getChaptersByProject(projectId: string): Promise<Chapter[]> {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('project_id', projectId)
      .order('idx', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch chapters: ${error.message}`);
    }

    return data || [];
  },

  async getChapter(chapterId: string): Promise<Chapter | null> {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch chapter: ${error.message}`);
    }

    return data;
  },

  async createChapter(chapter: CreateChapter): Promise<Chapter> {
    const { data, error } = await supabase
      .from('chapters')
      .insert(chapter)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create chapter: ${error.message}`);
    }

    return data;
  },

  async updateChapter(chapterId: string, updates: UpdateChapter): Promise<Chapter> {
    const { data, error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', chapterId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update chapter: ${error.message}`);
    }

    return data;
  },

  async updateChapterContent(chapterId: string, content: string): Promise<Chapter> {
    return this.updateChapter(chapterId, { content });
  },

  async deleteChapter(chapterId: string): Promise<void> {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);

    if (error) {
      throw new Error(`Failed to delete chapter: ${error.message}`);
    }
  },

  async reorderChapters(projectId: string, chapterIds: string[]): Promise<void> {
    const updates = chapterIds.map((id, index) => ({
      id,
      idx: index,
    }));

    for (const update of updates) {
      await this.updateChapter(update.id, { idx: update.idx });
    }
  },
};