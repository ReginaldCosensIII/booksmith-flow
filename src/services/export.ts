import { supabase } from "@/integrations/supabase/client";

export interface ExportRecord {
  id: string;
  project_id: string;
  format: string;
  file_name: string;
  file_size: number;
  file_url: string;
  metadata: any;
  created_at: string;
  status: 'processing' | 'completed' | 'failed';
}

export interface ExportMetadata {
  title: string;
  author: string;
  description: string;
  genre: string;
  isbn?: string;
  copyright: string;
  language: string;
}

class ExportService {
  async getProjectExports(projectId: string): Promise<ExportRecord[]> {
    const { data, error } = await supabase
      .from('exports')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching exports:', error);
      return [];
    }

    return data || [];
  }

  async createExport(
    projectId: string, 
    format: string, 
    metadata: ExportMetadata
  ): Promise<{ success: boolean; exportId?: string; error?: string }> {
    try {
      // First, get the project data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        return { success: false, error: 'Project not found' };
      }

      // Get chapters
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('project_id', projectId)
        .order('idx');

      if (chaptersError) {
        return { success: false, error: 'Failed to fetch chapters' };
      }

      // Create export record
      const fileName = `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${format.toLowerCase()}`;
      
      const { data: exportRecord, error: exportError } = await supabase
        .from('exports')
        .insert({
          project_id: projectId,
          format: format.toLowerCase(),
          file_name: fileName,
          file_size: 0, // Will be updated after file generation
          file_url: '', // Will be updated after file upload
          metadata,
          status: 'processing'
        })
        .select()
        .single();

      if (exportError || !exportRecord) {
        return { success: false, error: 'Failed to create export record' };
      }

      // Generate the export file
      const exportData = this.generateExportContent(project, chapters || [], metadata, format);
      const blob = new Blob([exportData], { 
        type: this.getContentType(format) 
      });

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exports')
        .upload(`${projectId}/${fileName}`, blob);

      if (uploadError) {
        // Update export record with error status
        await supabase
          .from('exports')
          .update({ status: 'failed' })
          .eq('id', exportRecord.id);
        
        return { success: false, error: 'Failed to upload export file' };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('exports')
        .getPublicUrl(`${projectId}/${fileName}`);

      // Update export record with file info
      await supabase
        .from('exports')
        .update({
          file_size: blob.size,
          file_url: publicUrlData.publicUrl,
          status: 'completed'
        })
        .eq('id', exportRecord.id);

      return { success: true, exportId: exportRecord.id };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  async deleteExport(exportId: string): Promise<boolean> {
    try {
      // Get export record to find file path
      const { data: exportRecord, error: fetchError } = await supabase
        .from('exports')
        .select('*')
        .eq('id', exportId)
        .single();

      if (fetchError || !exportRecord) {
        return false;
      }

      // Delete file from storage
      const filePath = `${exportRecord.project_id}/${exportRecord.file_name}`;
      await supabase.storage
        .from('exports')
        .remove([filePath]);

      // Delete export record
      const { error: deleteError } = await supabase
        .from('exports')
        .delete()
        .eq('id', exportId);

      return !deleteError;
    } catch (error) {
      console.error('Delete export error:', error);
      return false;
    }
  }

  private generateExportContent(
    project: any, 
    chapters: any[], 
    metadata: ExportMetadata, 
    format: string
  ): string {
    // Simple export generation - in a real app, you'd use proper libraries
    // like jsPDF for PDF, epub.js for EPUB, etc.
    
    const content = chapters
      .map(chapter => `# ${chapter.title}\n\n${chapter.content}`)
      .join('\n\n---\n\n');

    const fullContent = `
Title: ${metadata.title}
Author: ${metadata.author}
Genre: ${metadata.genre}
Copyright: ${metadata.copyright}
Language: ${metadata.language}
${metadata.isbn ? `ISBN: ${metadata.isbn}` : ''}

Description:
${metadata.description}

---

${content}
    `.trim();

    return fullContent;
  }

  private getContentType(format: string): string {
    switch (format.toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'epub':
        return 'application/epub+zip';
      case 'mobi':
        return 'application/x-mobipocket-ebook';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'text/plain';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }
}

export const exportService = new ExportService();