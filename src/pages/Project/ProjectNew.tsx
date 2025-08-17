import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { projectsService } from "@/services/projects";
import { chaptersService } from "@/services/chapters";
import { useNavigate } from "react-router-dom";
import { BookOpen, Target, Palette } from "lucide-react";

const ProjectNew = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    synopsis: "",
    goalWords: "",
    template: "blank"
  });

  const genres = [
    "Fantasy", "Science Fiction", "Mystery", "Romance", "Thriller", 
    "Horror", "Literary Fiction", "Historical Fiction", "Young Adult", 
    "Non-Fiction", "Biography", "Other"
  ];

  const templates = [
    { id: "blank", name: "Blank Project", description: "Start from scratch" },
    { id: "novel", name: "Novel", description: "Traditional novel structure" },
    { id: "screenplay", name: "Screenplay", description: "Script format" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a project",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Project title is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const project = await projectsService.createProject({
        user_id: user.id,
        title: formData.title.trim(),
        genre: formData.genre || undefined,
        synopsis: formData.synopsis.trim() || undefined,
        goal_words: formData.goalWords ? parseInt(formData.goalWords) : undefined,
        template: formData.template || undefined,
        status: 'active'
      });

      // Create the first chapter for the new project
      await chaptersService.createChapter({
        project_id: project.id,
        title: "Chapter 1",
        content: "",
        idx: 0
      });

      toast({
        title: "Success",
        description: "Project created successfully!",
      });

      navigate(`/project/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-muted-foreground">Set up your writing project with AI-powered assistance</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter your project title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={formData.genre} onValueChange={(value) => handleInputChange("genre", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="synopsis">Synopsis</Label>
                <Textarea
                  id="synopsis"
                  value={formData.synopsis}
                  onChange={(e) => handleInputChange("synopsis", e.target.value)}
                  placeholder="Brief description of your project"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Writing Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goalWords">Word Count Goal</Label>
                <Input
                  id="goalWords"
                  type="number"
                  value={formData.goalWords}
                  onChange={(e) => handleInputChange("goalWords", e.target.value)}
                  placeholder="e.g., 80000"
                  min="1000"
                  step="1000"
                />
                <p className="text-sm text-muted-foreground">
                  Set a target word count for your project
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Project Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => (
                  <label
                    key={template.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.template === template.id
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={formData.template === template.id}
                      onChange={(e) => handleInputChange("template", e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectNew;