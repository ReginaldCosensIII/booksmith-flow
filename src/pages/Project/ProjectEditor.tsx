import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RichTextEditor } from "@/components/Editor/RichTextEditor";
import { useAutosave } from "@/hooks/useAutosave";
import { useLocalBackup } from "@/hooks/useLocalBackup";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { chaptersService, type Chapter } from "@/services/chapters";
import { useAuth } from "@/hooks/useAuth";
import ChapterManager from "@/components/Project/ChapterManager";

const ProjectEditor = () => {
  const { id: projectId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentContent, setCurrentContent] = useState("");
  const [loading, setLoading] = useState(true);

  const currentChapter = chapters[currentChapterIndex];

  const handleChaptersUpdate = (updatedChapters: Chapter[]) => {
    setChapters(updatedChapters);
    // Update current content if current chapter changed
    if (updatedChapters[currentChapterIndex]) {
      setCurrentContent(updatedChapters[currentChapterIndex].content || "");
      setWordCount(updatedChapters[currentChapterIndex].word_count || 0);
    }
  };

  const handleChapterSelect = (index: number) => {
    if (index >= 0 && index < chapters.length) {
      setCurrentChapterIndex(index);
      setCurrentContent(chapters[index]?.content || "");
      setWordCount(chapters[index]?.word_count || 0);
    }
  };

  // Load chapters on mount
  useEffect(() => {
    const loadChapters = async () => {
      if (!projectId) return;

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(projectId)) {
        toast({
          title: "Invalid Project",
          description: "This project doesn't exist. Redirecting to dashboard...",
          variant: "destructive",
        });
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
        return;
      }

      try {
        setLoading(true);
        const data = await chaptersService.getChaptersByProject(projectId);
        setChapters(data);
        
        if (data.length > 0) {
          setCurrentContent(data[0].content || "");
          setWordCount(data[0].word_count || 0);
        } else {
          // No chapters exist, show empty state
          setCurrentContent("");
          setWordCount(0);
        }
      } catch (error) {
        console.error('Failed to load chapters:', error);
        toast({
          title: "Error",
          description: "Failed to load chapters. This project may not exist or you don't have access to it.",
          variant: "destructive",
        });
        // Redirect to dashboard after error
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    loadChapters();
  }, [projectId, toast]);

  // Local backup for current chapter
  const { restoreFromBackup, clearBackup } = useLocalBackup({
    userId: user?.id,
    projectId: projectId || '',
    chapterId: currentChapter?.id || '',
    content: currentContent,
    enabled: !!user && !!projectId && !!currentChapter,
  });

  // Autosave functionality
  const { saveStatus, save } = useAutosave(currentContent, {
    onSave: async (content: string) => {
      if (!currentChapter) return;

      const updatedChapter = await chaptersService.updateChapterContent(
        currentChapter.id,
        content
      );

      // Update local chapters state with new word count from DB
      setChapters(prev => prev.map(ch => 
        ch.id === currentChapter.id 
          ? { ...ch, content, word_count: updatedChapter.word_count }
          : ch
      ));

      // Clear backup after successful save
      clearBackup();
    },
    enabled: !!currentChapter,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: save,
    enabled: !!currentChapter,
  });

  // Handle chapter switching
  useEffect(() => {
    if (currentChapter) {
      const serverContent = currentChapter.content || "";
      const serverTimestamp = new Date(currentChapter.updated_at).getTime();
      
      // Restore from backup if available and newer
      const restoredContent = restoreFromBackup(serverContent, serverTimestamp);
      setCurrentContent(restoredContent);
      setWordCount(currentChapter.word_count || 0);
    }
  }, [currentChapterIndex, chapters, restoreFromBackup]);

  const handleContentChange = (newContent: string) => {
    setCurrentContent(newContent);
  };

  const handleWordCountChange = (count: number) => {
    setWordCount(count);
  };

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
          <div className="p-2">
            <ChapterManager
              projectId={projectId || ''}
              chapters={chapters}
              currentChapterIndex={currentChapterIndex}
              onChaptersUpdate={handleChaptersUpdate}
              onChapterSelect={handleChapterSelect}
            />
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">{currentChapter?.title || "Untitled Chapter"}</h2>
            <div className="text-sm text-muted-foreground">
              {wordCount} words
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                saveStatus === 'saved' ? 'bg-green-500' : 
                saveStatus === 'saving' ? 'bg-yellow-500' : 
                saveStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-muted-foreground">
                {saveStatus === 'saved' ? 'All changes saved' : 
                 saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'error' ? 'Save failed' : 'Unsaved changes'}
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
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading chapters...</div>
              </div>
            ) : chapters.length > 0 && currentChapter ? (
              <RichTextEditor
                content={currentContent}
                onChange={handleContentChange}
                onWordCount={handleWordCountChange}
                placeholder="Start writing your story..."
                className="h-full border-0"
              />
            ) : chapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="text-muted-foreground text-center">
                  <h3 className="text-lg font-medium mb-2">No chapters yet</h3>
                  <p>This project doesn't have any chapters. Create your first chapter to start writing!</p>
                </div>
                <ChapterManager
                  projectId={projectId || ''}
                  chapters={chapters}
                  currentChapterIndex={currentChapterIndex}
                  onChaptersUpdate={handleChaptersUpdate}
                  onChapterSelect={handleChapterSelect}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">No chapters found</div>
              </div>
            )}
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
              disabled={currentChapterIndex === 0}
              onClick={() => handleChapterSelect(currentChapterIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Chapter {currentChapterIndex + 1} of {chapters.length}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              disabled={currentChapterIndex === chapters.length - 1}
              onClick={() => handleChapterSelect(currentChapterIndex + 1)}
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