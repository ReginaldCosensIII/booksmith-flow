import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Target, 
  Calendar, 
  TrendingUp,
  Users,
  Globe,
  Palette,
  Edit3,
  BarChart3
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { projectsService, type Project } from "@/services/projects";

const ProjectOverview = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState({
    totalWords: 0,
    chaptersCount: 0,
    charactersCount: 0,
    worldNotesCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [projectData, projectStats] = await Promise.all([
        projectsService.getProject(id),
        projectsService.getProjectStats(id)
      ]);
      
      if (!projectData) {
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive",
        });
        return;
      }
      
      setProject(projectData);
      setStats(projectStats);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-xl font-semibold mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
        <Button asChild>
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const progress = project.goal_words ? Math.min((stats.totalWords / project.goal_words) * 100, 100) : 0;

  const quickStats = [
    {
      label: "Total Words",
      value: stats.totalWords.toLocaleString(),
      icon: Edit3,
      color: "text-green-600",
      bg: "bg-green-500/10"
    },
    {
      label: "Chapters",
      value: stats.chaptersCount.toString(),
      icon: BookOpen,
      color: "text-blue-600", 
      bg: "bg-blue-500/10"
    },
    {
      label: "Characters",
      value: stats.charactersCount.toString(),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-500/10"
    },
    {
      label: "World Notes",
      value: stats.worldNotesCount.toString(),
      icon: Globe,
      color: "text-orange-600",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Project Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">
            {project.genre || "No genre"} • Created {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        
        {/* Progress Section */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Writing Progress</h3>
                  <span className="text-sm font-medium">
                    {stats.totalWords.toLocaleString()} / {(project.goal_words || 0).toLocaleString()} words
                  </span>
                </div>
                <Progress value={progress} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {Math.round(progress)}% complete • {Math.max(0, (project.goal_words || 0) - stats.totalWords).toLocaleString()} words remaining
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Goal</h3>
                </div>
                <p className="text-2xl font-bold">{(project.goal_words || 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">total words</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" size="lg" asChild className="h-auto p-4 justify-start">
                <Link to={`/project/${id}/editor`}>
                  <Edit3 className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Continue Writing</div>
                    <div className="text-sm text-muted-foreground">Pick up where you left off</div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild className="h-auto p-4 justify-start">
                <Link to={`/project/${id}/characters`}>
                  <Users className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Characters</div>
                    <div className="text-sm text-muted-foreground">Add or edit characters</div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild className="h-auto p-4 justify-start">
                <Link to={`/project/${id}/worldbuilding`}>
                  <Globe className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Build Your World</div>
                    <div className="text-sm text-muted-foreground">Create locations & lore</div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild className="h-auto p-4 justify-start">
                <Link to={`/project/${id}/art`}>
                  <Palette className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Design Cover</div>
                    <div className="text-sm text-muted-foreground">Create your book cover</div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Status</h4>
              <p className="text-sm text-muted-foreground capitalize">{project.status}</p>
            </div>
            {project.synopsis && (
              <div>
                <h4 className="font-medium text-sm mb-2">Synopsis</h4>
                <p className="text-sm text-muted-foreground">{project.synopsis}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium text-sm mb-2">Last Updated</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(project.updated_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectOverview;