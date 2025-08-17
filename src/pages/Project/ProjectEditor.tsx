import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Bot,
  Save,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Sparkles,
  RefreshCw,
  Lightbulb,
  Target,
  Eye,
  EyeOff
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
}

const ProjectEditor = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Mock chapters data
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "1",
      title: "The Beginning",
      content: "In the mystical realm of Eldara, where dragons soar through crystalline skies and magic flows like rivers through ancient forests, our story begins...\n\nLyra Shadowmend stood at the edge of the Whispering Cliffs, her emerald eyes scanning the horizon for any sign of the legendary Dragon's Echo. The artifact had been lost for centuries, but the recent tremors in the magical ley lines suggested it was awakening.\n\nThe wind carried with it the scent of jasmine and something else—something ancient and powerful that made her skin tingle with anticipation. Today would change everything.",
      wordCount: 95
    },
    {
      id: "2", 
      title: "The Discovery",
      content: "As the sun began to set behind the mountains...",
      wordCount: 9
    }
  ]);

  const [currentContent, setCurrentContent] = useState(chapters[currentChapter]?.content || "");

  useEffect(() => {
    setCurrentContent(chapters[currentChapter]?.content || "");
  }, [currentChapter, chapters]);

  useEffect(() => {
    const words = currentContent.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    
    // Auto-save simulation
    if (currentContent !== chapters[currentChapter]?.content) {
      setSaveStatus('unsaved');
      
      const timer = setTimeout(() => {
        setSaveStatus('saving');
        setTimeout(() => {
          setSaveStatus('saved');
          // Update the chapter content
          setChapters(prev => prev.map((chapter, index) => 
            index === currentChapter 
              ? { ...chapter, content: currentContent, wordCount: words }
              : chapter
          ));
        }, 500);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentContent, currentChapter, chapters]);

  const aiSuggestions = [
    {
      type: "continue",
      icon: Sparkles,
      title: "Continue Writing",
      description: "Let AI help continue your story from where you left off"
    },
    {
      type: "rewrite", 
      icon: RefreshCw,
      title: "Rewrite Section",
      description: "Improve the selected text with different tone or style"
    },
    {
      type: "brainstorm",
      icon: Lightbulb,
      title: "Brainstorm Ideas",
      description: "Generate plot ideas, character development, or scene concepts"
    },
    {
      type: "outline",
      icon: Target,
      title: "Create Outline",
      description: "Structure your chapter with an AI-generated outline"
    }
  ];

  const handleAiAssist = (type: string) => {
    toast({
      title: "AI Assistant",
      description: `${type} feature is coming soon! This will help enhance your writing.`
    });
  };

  return (
    <div className={`flex h-screen ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'relative'}`}>
      {/* Chapter Sidebar */}
      {!isFullscreen && (
        <div className="hidden md:flex w-64 border-r bg-muted/30 flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Chapters</h3>
              <Button size="icon" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className={`p-3 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
                  index === currentChapter ? 'bg-accent border-l-4 border-l-primary' : ''
                }`}
                onClick={() => setCurrentChapter(index)}
              >
                <div className="font-medium text-sm mb-1">{chapter.title}</div>
                <div className="text-xs text-muted-foreground">
                  {chapter.wordCount} words
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">{chapters[currentChapter]?.title}</h2>
            <div className="text-sm text-muted-foreground">
              {wordCount} words
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                saveStatus === 'saved' ? 'bg-green-500' : 
                saveStatus === 'saving' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-muted-foreground">
                {saveStatus === 'saved' ? 'Saved' : 
                 saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
              </span>
            </div>
            
            <Separator orientation="vertical" className="h-4" />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
            >
              <Bot className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Writing Area */}
          <div className="flex-1 p-6">
            <Textarea
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              placeholder="Start writing your story..."
              className="w-full h-full resize-none border-0 focus-visible:ring-0 text-base leading-relaxed prose-writing"
              style={{ minHeight: 'calc(100vh - 200px)' }}
            />
          </div>

          {/* AI Assistant Panel */}
          {aiAssistantOpen && (
            <div className="w-80 border-l bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">AI Writing Assistant</h3>
              </div>
              
              <div className="space-y-3">
                {aiSuggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <Card 
                      key={suggestion.type}
                      className="cursor-pointer hover:shadow-soft transition-all bg-gradient-card border-0"
                      onClick={() => handleAiAssist(suggestion.title)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                            <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Writing Goals</h4>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <div className="text-sm font-medium mb-1">Daily Target</div>
                  <div className="text-xs text-muted-foreground">1,000 words</div>
                  <div className="w-full bg-accent/20 rounded-full h-2 mt-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chapter Navigation - Mobile */}
        {!isFullscreen && (
          <div className="md:hidden flex items-center justify-between p-4 border-t bg-background/95">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentChapter === 0}
              onClick={() => setCurrentChapter(currentChapter - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Chapter {currentChapter + 1} of {chapters.length}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              disabled={currentChapter === chapters.length - 1}
              onClick={() => setCurrentChapter(currentChapter + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile AI Assistant Button */}
      {!aiAssistantOpen && (
        <Button
          className="md:hidden fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-glow"
          onClick={() => setAiAssistantOpen(true)}
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default ProjectEditor;