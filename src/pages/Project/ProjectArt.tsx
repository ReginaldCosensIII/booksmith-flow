import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Sparkles, Download, RefreshCw, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { imageGenerationService, GeneratedImage } from "@/services/imageGeneration";
import { assetsService, Asset } from "@/services/assets";
import { generateCover } from "@/services/ai";
import { useParams } from "react-router-dom";

const ProjectArt = () => {
  const { toast } = useToast();
  const { id: projectId } = useParams();
  const [coverPrompt, setCoverPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCovers, setGeneratedCovers] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const artStyles = [
    { value: "fantasy", label: "Fantasy", description: "Mystical and magical themes" },
    { value: "sci-fi", label: "Sci-Fi", description: "Futuristic and technological" },
    { value: "mystery", label: "Mystery", description: "Dark and suspenseful" },
    { value: "romance", label: "Romance", description: "Romantic and emotional" },
    { value: "literary", label: "Literary", description: "Artistic and sophisticated" },
    { value: "minimalist", label: "Minimalist", description: "Clean and simple design" }
  ];

  // Load existing assets on mount
  useEffect(() => {
    const loadAssets = async () => {
      if (!projectId) return;

      try {
        const assets = await assetsService.getAssetsByProject(projectId);
        // Filter for cover type assets
        const covers = assets.filter(asset => asset.type === 'cover');
        setGeneratedCovers(covers);
      } catch (error) {
        console.error('Failed to load assets:', error);
        toast({
          title: "Error",
          description: "Failed to load existing covers.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, [projectId, toast]);


  const handleGenerateCover = async () => {
    if (!coverPrompt.trim() || !selectedStyle) {
      toast({
        title: "Missing Information",
        description: "Please enter a prompt and select a style.",
        variant: "destructive"
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is missing.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate the image using the new AI service
      const stylePrompt = `${coverPrompt} in ${selectedStyle} style, book cover design, professional quality`;
      const result = await generateCover({
        prompt: stylePrompt,
        size: "1024x1024",
        quality: "hd"
      });

      if (!result.images || result.images.length === 0) {
        throw new Error('No images generated');
      }

      // Save the generated image to the database
      const asset = await assetsService.createAsset({
        project_id: projectId,
        type: 'cover',
        url: result.images[0], // Use the base64 image URL
        prompt: coverPrompt
      });

      setGeneratedCovers(prev => [asset, ...prev]);
      
      toast({
        title: "Cover Generated!",
        description: "Your new book cover has been saved to the gallery."
      });
      
      // Clear the form
      setCoverPrompt("");
      setSelectedStyle("");
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate cover. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cover & Art Generation</h1>
          <p className="text-muted-foreground">Create stunning visuals for your book with AI-powered design tools</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Generate Cover
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Cover Description</Label>
                <Textarea
                  id="prompt"
                  value={coverPrompt}
                  onChange={(e) => setCoverPrompt(e.target.value)}
                  placeholder="Describe your ideal book cover... e.g., 'A dragon soaring over crystal mountains with a purple sky and golden lighting'"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Art Style</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an art style" />
                  </SelectTrigger>
                  <SelectContent>
                    {artStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-sm text-muted-foreground">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateCover} 
                disabled={isGenerating}
                className="w-full shadow-soft"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Cover
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <strong>💡 Pro Tips:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Be specific about colors, mood, and elements</li>
                  <li>• Mention the genre for better style matching</li>
                  <li>• Include lighting preferences (dark, bright, etc.)</li>
                  <li>• Describe key visual elements from your story</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cover Gallery */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Generated Covers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading covers...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {generatedCovers.map((cover, index) => (
                    <div key={`${cover.id}-${index}`} className="group relative">
                      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-dashed border-muted-foreground/20">
                        <img 
                          src={cover.url} 
                          alt={`Generated cover: ${cover.prompt || 'Generated cover'}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => {
                            toast({
                              title: "Cover Set!",
                              description: "This cover is now your project's main cover."
                            });
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Use Cover
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            if (cover.prompt) {
                              setCoverPrompt(cover.prompt);
                              toast({
                                title: "Prompt Loaded",
                                description: "The original prompt has been loaded for remixing."
                              });
                            }
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Remix
                        </Button>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium line-clamp-2">{cover.prompt || 'Generated cover'}</p>
                        <p className="text-xs text-muted-foreground">Cover • {new Date(cover.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Placeholder for new generation */}
                  {isGenerating && (
                    <div className="aspect-[2/3] rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-dashed border-primary/30 flex items-center justify-center">
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Generating...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {generatedCovers.length === 0 && !isGenerating && !isLoading && (
                <div className="text-center py-12">
                  <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
                    <Image className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">No covers generated yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first book cover using the generator</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Art Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Image className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Character Portraits</h3>
                <p className="text-sm text-muted-foreground">Generate images of your characters</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Palette className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Scene Illustrations</h3>
                <p className="text-sm text-muted-foreground">Visualize key scenes from your story</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Marketing Assets</h3>
                <p className="text-sm text-muted-foreground">Create promotional graphics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectArt;