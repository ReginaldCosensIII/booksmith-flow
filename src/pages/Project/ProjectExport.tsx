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
  AlertCircle,
  Printer,
  Truck,
  Shield,
  Smartphone,
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { exportService, ExportRecord, ExportMetadata } from "@/services/export";

const ProjectExport = () => {
  const { toast } = useToast();
  const { projectId } = useParams<{ projectId: string }>();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [recentExports, setRecentExports] = useState<ExportRecord[]>([]);
  
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

  useEffect(() => {
    if (projectId) {
      loadRecentExports();
    }
  }, [projectId]);

  const loadRecentExports = async () => {
    if (!projectId) return;
    
    const exports = await exportService.getProjectExports(projectId);
    setRecentExports(exports);
  };

  const handleExport = async (format: string) => {
    if (!projectId) return;
    
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const exportMetadata: ExportMetadata = {
        title: metadata.title,
        author: metadata.author,
        description: metadata.description,
        genre: metadata.genre,
        isbn: metadata.isbn,
        copyright: metadata.copyright,
        language: metadata.language
      };

      const result = await exportService.createExport(projectId, format, exportMetadata);
      
      if (result.success) {
        toast({
          title: "Export Complete!",
          description: `Your book has been exported as ${format.toUpperCase()}.`
        });
        // Reload exports list
        loadRecentExports();
      } else {
        toast({
          title: "Export Failed",
          description: result.error || "Failed to export book",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Digital Export */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Digital Export</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Export your book in various digital formats for online distribution or personal use.
          </p>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Book className="mr-2 h-4 w-4" />
              Export EPUB
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Smartphone className="mr-2 h-4 w-4" />
              Export MOBI
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export Word (.docx)
            </Button>
          </div>
        </Card>

        {/* Publishing Options */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Publishing</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Publish directly to major platforms and marketplaces.
          </p>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline" disabled>
              <ExternalLink className="mr-2 h-4 w-4" />
              Kindle Direct Publishing
              <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              <ExternalLink className="mr-2 h-4 w-4" />
              Apple Books
              <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              <ExternalLink className="mr-2 h-4 w-4" />
              Google Play Books
              <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Print-on-Demand Section */}
      <Card className="p-6 border-dashed border-2 border-muted-foreground/30 bg-muted/20 mb-8">
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Printer className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-muted-foreground">Print Setup</h3>
            <span className="px-3 py-1 bg-gradient-elegant text-gradient-text border border-primary/30 rounded-full text-sm font-medium">
              Coming Soon
            </span>
          </div>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Premium users will be able to order professionally printed books here. 
            Choose from paperback and hardcover options, customize trim sizes, 
            paper quality, and cover finishes. Get instant quotes and track your orders.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <Book className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Paperback</p>
              <p className="text-xs text-muted-foreground">Starting at $4.99</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <Book className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Hardcover</p>
              <p className="text-xs text-muted-foreground">Starting at $12.99</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <Truck className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Fast Shipping</p>
              <p className="text-xs text-muted-foreground">7-10 business days</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <Shield className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Quality Guarantee</p>
              <p className="text-xs text-muted-foreground">Professional printing</p>
            </div>
          </div>
          <Button disabled variant="outline" size="lg">
            <Printer className="mr-2 h-4 w-4" />
            Set Up Print Order
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Available with Premium subscription - Includes 1 free print credit per month
          </p>
        </div>
      </Card>

      {/* Export History */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExports.length > 0 ? (
              recentExports.map((exportRecord) => (
                <div key={exportRecord.id} className="flex items-center justify-between p-3 border rounded-lg bg-background/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{exportRecord.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exportService.formatDate(exportRecord.created_at)} • {exportService.formatFileSize(exportRecord.file_size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(exportRecord.status)}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownload(exportRecord.file_url, exportRecord.file_name)}
                      disabled={exportRecord.status !== 'completed'}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No exports yet</p>
                <p className="text-sm">Export your book to see downloads here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectExport;