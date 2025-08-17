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
  MoreVertical
} from "lucide-react";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  wordCount: number;
  wordGoal: number;
  lastEdited: string;
  genre: string;
  progress: number;
  coverColor: string;
}

const Dashboard = () => {
  // Mock data - in real app, this would come from API
  const projects: Project[] = [
    {
      id: "1",
      title: "The Dragon's Echo",
      wordCount: 45000,
      wordGoal: 80000,
      lastEdited: "2 hours ago",
      genre: "Fantasy",
      progress: 56,
      coverColor: "from-purple-500 to-pink-500"
    },
    {
      id: "2", 
      title: "Silicon Dreams",
      wordCount: 12000,
      wordGoal: 70000,
      lastEdited: "1 day ago",
      genre: "Sci-Fi",
      progress: 17,
      coverColor: "from-blue-500 to-cyan-500"
    },
    {
      id: "3",
      title: "The Last Detective",
      wordCount: 28000,
      wordGoal: 65000,
      lastEdited: "3 days ago", 
      genre: "Mystery",
      progress: 43,
      coverColor: "from-gray-700 to-gray-900"
    }
  ];

  const stats = {
    totalWords: projects.reduce((sum, project) => sum + project.wordCount, 0),
    activeProjects: projects.length,
    completedProjects: 2,
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
          {projects.map((project) => (
            <Card key={project.id} className="group hover:shadow-elegant transition-all duration-300 border-0 bg-gradient-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-16 rounded-lg bg-gradient-to-br ${project.coverColor} shadow-sm`} />
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{project.genre}</p>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{formatNumber(project.wordCount)} / {formatNumber(project.wordGoal)}</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Last edited {project.lastEdited}</span>
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
          ))}

          {/* Create New Project Card */}
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