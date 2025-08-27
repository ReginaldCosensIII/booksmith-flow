import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bot, Lightbulb, RefreshCw, FileText, Zap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService, type AIWritingOptions } from '@/services/ai';

interface AIAssistantPanelProps {
  currentContent: string;
  chapterTitle?: string;
  projectGenre?: string;
  onContentGenerated: (content: string) => void;
  className?: string;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  currentContent,
  chapterTitle,
  projectGenre,
  onContentGenerated,
  className = ""
}) => {
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [lastResponse, setLastResponse] = useState<{
    content: string;
    suggestions: string[];
    feature: string;
  } | null>(null);
  const { toast } = useToast();

  const handleAIAction = async (
    feature: 'continue' | 'rewrite' | 'brainstorm' | 'outline',
    customInstructions?: string
  ) => {
    if (!currentContent.trim() && feature !== 'brainstorm' && feature !== 'outline') {
      toast({
        title: "Content Required",
        description: "Please write some content first before using this feature.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setActiveFeature(feature);

    try {
      const options: AIWritingOptions = {
        currentContent: customInstructions || currentContent,
        chapterTitle,
        projectGenre,
        style: feature
      };

      let response;
      switch (feature) {
        case 'continue':
          response = await aiService.continueWriting(options);
          break;
        case 'rewrite':
          response = await aiService.rewriteContent(options);
          break;
        case 'brainstorm':
          response = await aiService.brainstormIdeas(options);
          break;
        case 'outline':
          response = await aiService.generateOutline(options);
          break;
        default:
          throw new Error('Unknown AI feature');
      }

      setLastResponse({
        content: response.content,
        suggestions: response.suggestions || [],
        feature
      });

      toast({
        title: "AI Assistant",
        description: `${feature.charAt(0).toUpperCase() + feature.slice(1)} completed successfully!`
      });

    } catch (error) {
      console.error('AI Service Error:', error);
      toast({
        title: "AI Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setActiveFeature(null);
    }
  };

  const handleUseContent = () => {
    if (lastResponse) {
      onContentGenerated(lastResponse.content);
      toast({
        title: "Content Added",
        description: "AI generated content has been added to your chapter."
      });
    }
  };

  return (
    <div className={`w-80 border-l bg-muted/30 ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">AI Writing Assistant</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Get AI-powered help with your writing
        </p>
      </div>

      <Tabs defaultValue="quick" className="h-full">
        <TabsList className="grid w-full grid-cols-2 m-2">
          <TabsTrigger value="quick">Quick Actions</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="p-4 space-y-3">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleAIAction('continue')}
              disabled={loading}
            >
              {loading && activeFeature === 'continue' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Continue Writing
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleAIAction('rewrite')}
              disabled={loading}
            >
              {loading && activeFeature === 'rewrite' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Rewrite Content
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleAIAction('brainstorm')}
              disabled={loading}
            >
              {loading && activeFeature === 'brainstorm' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4 mr-2" />
              )}
              Brainstorm Ideas
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleAIAction('outline')}
              disabled={loading}
            >
              {loading && activeFeature === 'outline' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Generate Outline
            </Button>
          </div>

          {lastResponse && (
            <>
              <Separator />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Badge variant="secondary">{lastResponse.feature}</Badge>
                    AI Response
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScrollArea className="h-32 w-full">
                    <p className="text-sm whitespace-pre-wrap">{lastResponse.content}</p>
                  </ScrollArea>
                  
                  {lastResponse.suggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Suggestions:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {lastResponse.suggestions.map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button size="sm" onClick={handleUseContent} className="w-full">
                    Use This Content
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="custom" className="p-4 space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Custom Instructions</label>
            <Textarea
              placeholder="Describe what you want the AI to help you with..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <Button
            onClick={() => handleAIAction('continue', customPrompt)}
            disabled={loading || !customPrompt.trim()}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bot className="h-4 w-4 mr-2" />
            )}
            Generate Content
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistantPanel;