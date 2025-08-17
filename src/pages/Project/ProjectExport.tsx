import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  Book, 
  Globe, 
  Settings,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ProjectExport = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  const [metadata, setMetadata] = useState({
    title: "The Dragon's Echo",
    author: "Your Name",
    description: "A magical tale of dragons, mages, and ancient artifacts in the mystical realm of Eldara.",
    genre: "Fantasy",
    isbn: "",
    copyright: "2024",
    language: "English"
  });

  const exportFormats = [
    {
      type: "pdf",
      name: "PDF",
      description: "Print-ready PDF for physical publishing",
      icon: FileText,
      size: "~2.5 MB",
      status: "ready"
    },
    {
      type: "epub",
      name: "EPUB",
      description: "Standard e-book format for digital platforms",
      icon: Book,
      size: "~1.8 MB", 
      status: "ready"
    },
    {
      type: "mobi",
      name: "MOBI",
      description: "Kindle-compatible format",
      icon: Book,
      size: "~2.1 MB",
      status: "processing"
    },
    {
      type: "docx",
      name: "Word Document",
      description: "Microsoft Word format for further editing",
      icon: FileText,
      size: "~750 KB",
      status: "ready"
    }
  ];

  const publishingPlatforms = [
    {
      name: "Amazon KDP",
      description: "Kindle Direct Publishing",
      logo: "📚",
      status: "not_connected"
    },
    {
      name: "Draft2Digital",
      description: "Multi-platform distribution",
      logo: "🌐",
      status: "not_connected"
    },
    {
      name: "IngramSpark",
      description: "Print-on-demand publishing",
      logo: "📖",
      status: "not_connected"
    }
  ];

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          toast({
            title: "Export Complete!",
            description: `Your book has been exported as ${format.toUpperCase()}.`
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Export & Publish</h1>
          <p className="text-muted-foreground">Export your book in various formats and publish to platforms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metadata Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Book Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={metadata.author}
                  onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={metadata.genre}
                    onChange={(e) => setMetadata({ ...metadata, genre: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copyright">Copyright</Label>
                  <Input
                    id="copyright"
                    value={metadata.copyright}
                    onChange={(e) => setMetadata({ ...metadata, copyright: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN (Optional)</Label>
                <Input
                  id="isbn"
                  value={metadata.isbn}
                  onChange={(e) => setMetadata({ ...metadata, isbn: e.target.value })}
                  placeholder="978-0-000000-00-0"
                />
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <Label>Export Progress</Label>
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{exportProgress}% complete</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Export Formats */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <Card key={format.type} className="border bg-background/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{format.name}</h3>
                              <p className="text-sm text-muted-foreground">{format.description}</p>
                            </div>
                          </div>
                          {getStatusIcon(format.status)}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Est. size: {format.size}</span>
                          <Button 
                            size="sm" 
                            disabled={format.status !== 'ready' || isExporting}
                            onClick={() => handleExport(format.type)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Publishing Platforms */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Publishing Platforms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publishingPlatforms.map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{platform.logo}</div>
                      <div>
                        <h3 className="font-semibold">{platform.name}</h3>
                        <p className="text-sm text-muted-foreground">{platform.description}</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant={platform.status === 'connected' ? 'outline' : 'default'}
                      size="sm"
                    >
                      {platform.status === 'connected' ? 'Publish' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Need help with publishing? Check out our publishing guide.
                </p>
                <Button variant="link" size="sm">
                  View Publishing Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export History */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { format: 'PDF', date: '2 hours ago', size: '2.5 MB', status: 'completed' },
              { format: 'EPUB', date: '1 day ago', size: '1.8 MB', status: 'completed' },
              { format: 'DOCX', date: '3 days ago', size: '750 KB', status: 'completed' }
            ].map((export_, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-background/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{metadata.title}.{export_.format.toLowerCase()}</p>
                    <p className="text-sm text-muted-foreground">{export_.date} • {export_.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectExport;