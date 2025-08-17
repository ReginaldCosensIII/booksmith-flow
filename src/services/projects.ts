import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Project = Tables<'projects'>;
export type CreateProject = TablesInsert<'projects'>;
export type UpdateProject = TablesUpdate<'projects'>;

export const projectsService = {
  async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data || [];
  },

  async getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data;
  },

  async createProject(project: CreateProject): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data;
  },

  async updateProject(projectId: string, updates: UpdateProject): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return data;
  },

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  },

  async getProjectStats(projectId: string) {
    // Get chapters for word count calculation
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('word_count')
      .eq('project_id', projectId);

    if (chaptersError) {
      throw new Error(`Failed to fetch project stats: ${chaptersError.message}`);
    }

    const totalWords = chapters?.reduce((sum, chapter) => sum + (chapter.word_count || 0), 0) || 0;

    // Get other counts
    const [
      { count: chaptersCount },
      { count: charactersCount },
      { count: worldNotesCount }
    ] = await Promise.all([
      supabase.from('chapters').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('characters').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('world_notes').select('*', { count: 'exact', head: true }).eq('project_id', projectId)
    ]);

    return {
      totalWords,
      chaptersCount: chaptersCount || 0,
      charactersCount: charactersCount || 0,
      worldNotesCount: worldNotesCount || 0
    };
  }
};