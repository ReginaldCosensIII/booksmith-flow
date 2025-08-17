import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Sparkles, Download, RefreshCw, Image } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ProjectArt = () => {
  const { toast } = useToast();
  const [coverPrompt, setCoverPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const artStyles = [
    { value: "fantasy", label: "Fantasy", description: "Mystical and magical themes" },
    { value: "sci-fi", label: "Sci-Fi", description: "Futuristic and technological" },
    { value: "mystery", label: "Mystery", description: "Dark and suspenseful" },
    { value: "romance", label: "Romance", description: "Romantic and emotional" },
    { value: "literary", label: "Literary", description: "Artistic and sophisticated" },
    { value: "minimalist", label: "Minimalist", description: "Clean and simple design" }
  ];

  const mockGeneratedCovers = [
    {
      id: 1,
      prompt: "Dragon soaring over crystal mountains with purple sky",
      style: "Fantasy",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop"
    },
    {
      id: 2,
      prompt: "Mystical forest with floating lights and ancient ruins",
      style: "Fantasy", 
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=450&fit=crop"
    },
    {
      id: 3,
      prompt: "Silhouette of a mage casting spells against starry sky",
      style: "Fantasy",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop"
    }
  ];

  const handleGenerateCover = async () => {
    if (!coverPrompt.trim() || !selectedStyle) {
      toast({
        title: "Missing Information",
        description: "Please enter a prompt and select a style.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // TODO: Implement actual AI cover generation
    setTimeout(() => {
      toast({
        title: "Cover Generated!",
        description: "Your new book cover has been added to the gallery."
      });
      setIsGenerating(false);
    }, 3000);
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mockGeneratedCovers.map((cover) => (
                  <div key={cover.id} className="group relative">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-dashed border-muted-foreground/20">
                      <img 
                        src={cover.image} 
                        alt={`Generated cover: ${cover.prompt}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Download className="h-4 w-4 mr-1" />
                        Use Cover
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Remix
                      </Button>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium line-clamp-2">{cover.prompt}</p>
                      <p className="text-xs text-muted-foreground">{cover.style} Style</p>
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
              
              {mockGeneratedCovers.length === 0 && !isGenerating && (
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