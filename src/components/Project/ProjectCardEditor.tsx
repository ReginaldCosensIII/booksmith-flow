import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { projectsService } from "@/services/projects";

interface ProjectCardEditorProps {
  projectId: string;
  title: string;
  onTitleUpdate: (newTitle: string) => void;
  className?: string;
}

const ProjectCardEditor = ({ 
  projectId, 
  title, 
  onTitleUpdate, 
  className = "" 
}: ProjectCardEditorProps) => {
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
      <div className={`flex items-center gap-1 ${className}`}>
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
          className="text-lg font-medium h-auto py-0 px-1 border border-primary bg-background"
          autoFocus
          disabled={isUpdating}
        />
        <Button
          size="icon"
          onClick={handleSave}
          disabled={isUpdating}
          className="h-6 w-6"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleCancel}
          disabled={isUpdating}
          className="h-6 w-6"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 group/title ${className}`}>
      <h3 
        className="text-lg leading-tight font-medium cursor-pointer flex-1"
        onDoubleClick={() => setIsEditing(true)}
      >
        {title}
      </h3>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 opacity-0 group-hover/title:opacity-100 transition-opacity"
      >
        <Edit3 className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ProjectCardEditor;