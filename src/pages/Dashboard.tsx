import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Users,
  Globe,
  Palette,
  MoreVertical,
  Trash2,
  Edit3
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { projectsService, type Project } from "@/services/projects";
import { useOptimisticUpdate } from "@/hooks/useOptimisticUpdate";

interface ProjectWithStats extends Project {
  wordCount: number;
  progress: number;
  coverColor: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Optimistic delete project operation
  const { execute: executeDelete } = useOptimisticUpdate(
    projectsService.deleteProject,
    {
      successMessage: "Project deleted successfully!",
      errorMessage: "Failed to delete project. Please try again."
    }
  );

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userProjects = await projectsService.getUserProjects(user.id);
      
      // Get stats for each project
      const projectsWithStats = await Promise.all(
        userProjects.map(async (project) => {
          try {
            const stats = await projectsService.getProjectStats(project.id);
            const progress = project.goal_words ? Math.min((stats.totalWords / project.goal_words) * 100, 100) : 0;
            
            // Generate consistent colors based on project id
            const colors = [
              "from-purple-500 to-pink-500",
              "from-blue-500 to-cyan-500", 
              "from-green-500 to-emerald-500",
              "from-orange-500 to-red-500",
              "from-indigo-500 to-purple-500",
              "from-gray-700 to-gray-900"
            ];
            const colorIndex = parseInt(project.id.slice(-1), 36) % colors.length;
            
            return {
              ...project,
              wordCount: stats.totalWords,
              progress: Math.round(progress),
              coverColor: colors[colorIndex]
            };
          } catch (error) {
            console.error(`Failed to load stats for project ${project.id}:`, error);
            return {
              ...project,
              wordCount: 0,
              progress: 0,
              coverColor: "from-gray-500 to-gray-700"
            };
          }
        })
      );
      
      setProjects(projectsWithStats);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      return;
    }

    const originalProjects = [...projects];
    const optimisticProjects = projects.filter(p => p.id !== projectId);

    await executeDelete(
      () => setProjects(optimisticProjects),
      () => setProjects(originalProjects),
      projectId
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  };

  const stats = {
    totalWords: projects.reduce((sum, project) => sum + project.wordCount, 0),
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'finished').length,
    weeklyGoal: 5000
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Stats Grid */}
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Writing Dashboard</h1>
          <p className="text-muted-foreground">Keep track of your projects and writing progress</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Words</p>
                  <p className="text-xl font-bold">{formatNumber(stats.totalWords)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-xl font-bold">{stats.activeProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">{stats.completedProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Goal</p>
                  <p className="text-xl font-bold">{formatNumber(stats.weeklyGoal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your Projects</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-elegant/10 border border-primary/20 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium text-primary">Plan: Free</span>
            </div>
            <Button className="shadow-soft" asChild>
              <Link to="/project/new">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading projects...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">Create your first project to get started!</p>
              <Button asChild>
                <Link to="/project/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Link>
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="group hover:shadow-elegant transition-all duration-300 border-0 bg-gradient-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-16 rounded-lg bg-gradient-to-br ${project.coverColor} shadow-sm`} />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/project/${project.id}`}>
                          <Edit3 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteProject(project.id, project.title);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{project.genre || "No genre"}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {formatNumber(project.wordCount)} / {formatNumber(project.goal_words || 0)}
                        </span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Last edited {formatTimeAgo(project.updated_at)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link to={`/project/${project.id}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Overview
                        </Link>
                      </Button>
                      <Button size="sm" asChild className="flex-1">
                        <Link to={`/project/${project.id}/editor`}>
                          Continue Writing
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Create New Project Card - only show if there are existing projects */}
          {!loading && projects.length > 0 && (
            <Card className="group hover:shadow-elegant transition-all duration-300 border-2 border-dashed border-muted-foreground/20 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Start a New Project</h3>
                <p className="text-muted-foreground mb-4">Begin your next masterpiece with AI-powered assistance</p>
                <Button asChild>
                  <Link to="/project/new">
                    Create Project
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Character Builder</h3>
                  <p className="text-sm text-muted-foreground">Create detailed character profiles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">World Builder</h3>
                  <p className="text-sm text-muted-foreground">Design immersive worlds</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-500/10 rounded-lg">
                  <Palette className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Cover Designer</h3>
                  <p className="text-sm text-muted-foreground">Generate stunning book covers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;