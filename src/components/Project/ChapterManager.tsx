import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  GripVertical, 
  Edit3, 
  Trash2,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { chaptersService, type Chapter, type CreateChapter } from "@/services/chapters";

interface ChapterManagerProps {
  projectId: string;
  chapters: Chapter[];
  currentChapterIndex: number;
  onChaptersUpdate: (chapters: Chapter[]) => void;
  onChapterSelect: (index: number) => void;
}

const ChapterManager = ({ 
  projectId, 
  chapters, 
  currentChapterIndex, 
  onChaptersUpdate, 
  onChapterSelect 
}: ChapterManagerProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) {
      toast({
        title: "Error",
        description: "Chapter title is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    // Optimistic update
    const tempChapter: Chapter = {
      id: `temp-${Date.now()}`,
      project_id: projectId,
      title: newChapterTitle.trim(),
      content: "",
      idx: chapters.length,
      word_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const optimisticChapters = [...chapters, tempChapter];
    onChaptersUpdate(optimisticChapters);

    try {
      const newChapter = await chaptersService.createChapter({
        project_id: projectId,
        title: newChapterTitle.trim(),
        content: "",
        idx: chapters.length
      });

      // Replace temp chapter with real one
      const updatedChapters = optimisticChapters.map(ch => 
        ch.id === tempChapter.id ? newChapter : ch
      );
      onChaptersUpdate(updatedChapters);

      toast({
        title: "Success",
        description: `Chapter "${newChapterTitle}" created successfully!`,
      });

      setNewChapterTitle("");
    } catch (error) {
      console.error('Failed to create chapter:', error);
      
      // Rollback optimistic update
      onChaptersUpdate(chapters);
      
      toast({
        title: "Error",
        description: "Failed to create chapter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteChapter = async (chapterIndex: number) => {
    if (chapters.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one chapter.",
        variant: "destructive",
      });
      return;
    }

    const chapterToDelete = chapters[chapterIndex];
    
    // Optimistic update
    const optimisticChapters = chapters.filter((_, index) => index !== chapterIndex);
    const newCurrentIndex = currentChapterIndex >= chapterIndex && currentChapterIndex > 0 
      ? currentChapterIndex - 1 
      : currentChapterIndex;
    
    onChaptersUpdate(optimisticChapters);
    onChapterSelect(Math.min(newCurrentIndex, optimisticChapters.length - 1));

    try {
      await chaptersService.deleteChapter(chapterToDelete.id);
      
      toast({
        title: "Success",
        description: `Chapter "${chapterToDelete.title}" deleted successfully!`,
      });
    } catch (error) {
      console.error('Failed to delete chapter:', error);
      
      // Rollback optimistic update
      onChaptersUpdate(chapters);
      onChapterSelect(currentChapterIndex);
      
      toast({
        title: "Error",
        description: "Failed to delete chapter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Optimistic update
    const newChapters = [...chapters];
    const draggedChapter = newChapters[draggedIndex];
    newChapters.splice(draggedIndex, 1);
    newChapters.splice(dropIndex, 0, draggedChapter);

    // Update indices
    const reorderedChapters = newChapters.map((chapter, index) => ({
      ...chapter,
      idx: index
    }));

    onChaptersUpdate(reorderedChapters);

    // Update current chapter index if needed
    let newCurrentIndex = currentChapterIndex;
    if (currentChapterIndex === draggedIndex) {
      newCurrentIndex = dropIndex;
    } else if (currentChapterIndex > draggedIndex && currentChapterIndex <= dropIndex) {
      newCurrentIndex = currentChapterIndex - 1;
    } else if (currentChapterIndex < draggedIndex && currentChapterIndex >= dropIndex) {
      newCurrentIndex = currentChapterIndex + 1;
    }
    onChapterSelect(newCurrentIndex);

    try {
      const chapterIds = reorderedChapters.map(ch => ch.id);
      await chaptersService.reorderChapters(projectId, chapterIds);
      
      toast({
        title: "Success",
        description: "Chapters reordered successfully!",
      });
    } catch (error) {
      console.error('Failed to reorder chapters:', error);
      
      // Rollback optimistic update
      onChaptersUpdate(chapters);
      onChapterSelect(currentChapterIndex);
      
      toast({
        title: "Error",
        description: "Failed to reorder chapters. Please try again.",
        variant: "destructive",
      });
    }

    setDraggedIndex(null);
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Chapters ({chapters.length})
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chapter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chapter-title">Chapter Title</Label>
                  <Input
                    id="chapter-title"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="Enter chapter title"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateChapter()}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setNewChapterTitle("")}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateChapter}
                    disabled={isCreating || !newChapterTitle.trim()}
                  >
                    {isCreating ? "Creating..." : "Create Chapter"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {chapters.map((chapter, index) => (
          <div
            key={chapter.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
              index === currentChapterIndex
                ? "border-primary bg-primary/5"
                : "border-muted hover:bg-muted/50"
            } ${draggedIndex === index ? "opacity-50" : ""}`}
            onClick={() => onChapterSelect(index)}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{chapter.title}</h4>
              <p className="text-sm text-muted-foreground">
                {chapter.word_count?.toLocaleString() || 0} words
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChapter(index);
              }}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {chapters.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No chapters yet</p>
            <p className="text-sm">Create your first chapter to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChapterManager;