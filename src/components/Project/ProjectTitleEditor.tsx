import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { projectsService } from "@/services/projects";

interface ProjectTitleEditorProps {
  projectId: string;
  title: string;
  onTitleUpdate: (newTitle: string) => void;
  className?: string;
}

const ProjectTitleEditor = ({ 
  projectId, 
  title, 
  onTitleUpdate, 
  className = "" 
}: ProjectTitleEditorProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      toast({
        title: "Error",
        description: "Project title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (editTitle.trim() === title) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    
    try {
      await projectsService.updateProject(projectId, { title: editTitle.trim() });
      
      onTitleUpdate(editTitle.trim());
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Project title updated successfully!",
      });
    } catch (error) {
      console.error('Failed to update project title:', error);
      
      toast({
        title: "Error", 
        description: "Failed to update project title. Please try again.",
        variant: "destructive",
      });
      
      setEditTitle(title); // Reset to original
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(title);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave();
            } else if (e.key === 'Escape') {
              handleCancel();
            }
          }}
          className="text-3xl font-bold h-auto py-1 px-2 border-2 border-primary"
          autoFocus
          disabled={isUpdating}
        />
        <Button
          size="icon"
          onClick={handleSave}
          disabled={isUpdating}
          className="h-8 w-8"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleCancel}
          disabled={isUpdating}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <h1 className="text-3xl font-bold">{title}</h1>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit3 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProjectTitleEditor;