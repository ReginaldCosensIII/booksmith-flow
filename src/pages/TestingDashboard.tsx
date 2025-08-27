import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TestTube, 
  Database, 
  Shield, 
  Smartphone,
  Zap,
  Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface TestItem {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'passed' | 'failed' | 'warning';
  category: 'auth' | 'projects' | 'chapters' | 'characters' | 'worldbuilding' | 'performance' | 'mobile' | 'security';
  manual?: boolean;
}

const TestingDashboard: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<Record<string, TestItem['status']>>({});

  const testItems: TestItem[] = [
    // Authentication Tests
    { id: 'auth-register', name: 'User Registration', description: 'Test new user signup with validation', status: 'pending', category: 'auth', manual: true },
    { id: 'auth-login', name: 'User Login', description: 'Test existing user login and session', status: 'pending', category: 'auth', manual: true },
    { id: 'auth-logout', name: 'User Logout', description: 'Test session termination', status: 'pending', category: 'auth', manual: true },
    { id: 'auth-protected', name: 'Protected Routes', description: 'Test redirect when not authenticated', status: 'pending', category: 'auth', manual: true },
    
    // Projects CRUD
    { id: 'projects-create', name: 'Create Project', description: 'Test project creation with templates', status: 'pending', category: 'projects', manual: true },
    { id: 'projects-view', name: 'View Projects', description: 'Test dashboard project listing', status: 'pending', category: 'projects', manual: true },
    { id: 'projects-update', name: 'Update Project', description: 'Test editing project details', status: 'pending', category: 'projects', manual: true },
    { id: 'projects-delete', name: 'Delete Project', description: 'Test project deletion with cleanup', status: 'pending', category: 'projects', manual: true },
    { id: 'projects-stats', name: 'Project Stats', description: 'Test word count and statistics', status: 'pending', category: 'projects', manual: true },
    
    // Chapters CRUD
    { id: 'chapters-create', name: 'Create Chapter', description: 'Test chapter creation and auto-setup', status: 'pending', category: 'chapters', manual: true },
    { id: 'chapters-view', name: 'View Chapters', description: 'Test chapter listing and ordering', status: 'pending', category: 'chapters', manual: true },
    { id: 'chapters-update', name: 'Update Chapter', description: 'Test chapter editing and content', status: 'pending', category: 'chapters', manual: true },
    { id: 'chapters-delete', name: 'Delete Chapter', description: 'Test chapter removal', status: 'pending', category: 'chapters', manual: true },
    { id: 'chapters-reorder', name: 'Reorder Chapters', description: 'Test drag and drop reordering', status: 'pending', category: 'chapters', manual: true },
    
    // Characters CRUD
    { id: 'characters-create', name: 'Create Character', description: 'Test character creation with all fields', status: 'pending', category: 'characters', manual: true },
    { id: 'characters-view', name: 'View Characters', description: 'Test character listing with role badges', status: 'pending', category: 'characters', manual: true },
    { id: 'characters-update', name: 'Update Character', description: 'Test character editing', status: 'pending', category: 'characters', manual: true },
    { id: 'characters-delete', name: 'Delete Character', description: 'Test character removal', status: 'pending', category: 'characters', manual: true },
    
    // Worldbuilding CRUD
    { id: 'worldbuilding-create', name: 'Create World Note', description: 'Test world note creation with types', status: 'pending', category: 'worldbuilding', manual: true },
    { id: 'worldbuilding-filter', name: 'Filter Notes', description: 'Test type-based filtering', status: 'pending', category: 'worldbuilding', manual: true },
    { id: 'worldbuilding-update', name: 'Update World Note', description: 'Test world note editing', status: 'pending', category: 'worldbuilding', manual: true },
    { id: 'worldbuilding-delete', name: 'Delete World Note', description: 'Test world note removal', status: 'pending', category: 'worldbuilding', manual: true },
    
    // Performance Tests
    { id: 'performance-autosave', name: 'Autosave Function', description: 'Test automatic content saving', status: 'pending', category: 'performance', manual: true },
    { id: 'performance-backup', name: 'Local Backup', description: 'Test localStorage backup/restore', status: 'pending', category: 'performance', manual: true },
    { id: 'performance-optimistic', name: 'Optimistic Updates', description: 'Test immediate UI updates', status: 'pending', category: 'performance', manual: true },
    { id: 'performance-loading', name: 'Loading States', description: 'Test loading indicators', status: 'pending', category: 'performance', manual: true },
    
    // Mobile Tests
    { id: 'mobile-navigation', name: 'Mobile Navigation', description: 'Test bottom tab bar functionality', status: 'pending', category: 'mobile', manual: true },
    { id: 'mobile-editor', name: 'Mobile Editor', description: 'Test rich text editor on mobile', status: 'pending', category: 'mobile', manual: true },
    { id: 'mobile-forms', name: 'Mobile Forms', description: 'Test all forms on mobile devices', status: 'pending', category: 'mobile', manual: true },
    
    // Security Tests
    { id: 'security-rls', name: 'RLS Policies', description: 'Test row-level security enforcement', status: 'pending', category: 'security', manual: true },
    { id: 'security-input', name: 'Input Sanitization', description: 'Test XSS protection in editor', status: 'pending', category: 'security', manual: true },
    { id: 'security-password', name: 'Password Security', description: 'Test password strength validation', status: 'pending', category: 'security', manual: true },
  ];

  const updateTestStatus = (testId: string, status: TestItem['status']) => {
    setTestResults(prev => ({ ...prev, [testId]: status }));
    toast({
      title: "Test Updated",
      description: `${testItems.find(t => t.id === testId)?.name} marked as ${status}`,
      variant: status === 'failed' ? 'destructive' : 'default'
    });
  };

  const getStatusIcon = (status: TestItem['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <div className="h-4 w-4 rounded-full bg-muted border-2" />;
    }
  };

  const getStatusBadge = (status: TestItem['status']) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getCategoryIcon = (category: TestItem['category']) => {
    const icons = {
      auth: Shield,
      projects: Database,
      chapters: Database,
      characters: Database,
      worldbuilding: Database,
      performance: Zap,
      mobile: Smartphone,
      security: Shield
    };
    const Icon = icons[category];
    return <Icon className="h-4 w-4" />;
  };

  const groupedTests = testItems.reduce((acc, test) => {
    if (!acc[test.category]) acc[test.category] = [];
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, TestItem[]>);

  const getTestStats = () => {
    const total = testItems.length;
    const completed = Object.keys(testResults).length;
    const passed = Object.values(testResults).filter(status => status === 'passed').length;
    const failed = Object.values(testResults).filter(status => status === 'failed').length;
    
    return { total, completed, passed, failed };
  };

  const stats = getTestStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TestTube className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Pre-AI Integration Testing</h1>
      </div>

      {!user && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <p>Please log in to test authenticated features.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <p className="text-sm text-muted-foreground">Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Testing Categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="worldbuilding">World</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-6">
            {Object.entries(groupedTests).map(([category, tests]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getCategoryIcon(category as TestItem['category'])}
                    {category.charAt(0).toUpperCase() + category.slice(1)} Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(testResults[test.id] || test.status)}
                        <div>
                          <h4 className="font-medium">{test.name}</h4>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(testResults[test.id] || test.status)}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTestStatus(test.id, 'passed')}
                          >
                            Pass
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTestStatus(test.id, 'failed')}
                          >
                            Fail
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {Object.entries(groupedTests).map(([category, tests]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category as TestItem['category'])}
                  {category.charAt(0).toUpperCase() + category.slice(1)} Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(testResults[test.id] || test.status)}
                      <div>
                        <h4 className="font-medium">{test.name}</h4>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(testResults[test.id] || test.status)}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTestStatus(test.id, 'passed')}
                        >
                          Pass
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTestStatus(test.id, 'failed')}
                        >
                          Fail
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* AI Integration Readiness */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Bot className="h-5 w-5" />
            AI Integration Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Basic CRUD Operations</span>
              <Badge variant={stats.failed > 0 ? "destructive" : stats.passed > 15 ? "default" : "outline"}>
                {stats.failed > 0 ? "Issues Found" : stats.passed > 15 ? "Ready" : "Testing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Security & Authentication</span>
              <Badge variant="outline">Pending Tests</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Performance & UX</span>
              <Badge variant="outline">Pending Tests</Badge>
            </div>
            <Separator />
            <p className="text-sm text-blue-800">
              Complete all tests above before proceeding with OpenAI API integration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingDashboard;