import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { askAI } from '@/services/ai';
import { toast } from 'sonner';

interface AICoachProps {
  onResult?: (text: string) => void;
}

const AICoach: React.FC<AICoachProps> = ({ onResult }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    try {
      const result = await askAI({
        system: "You are Booksmith's writing coach. Keep suggestions concise and actionable.",
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_output_tokens: 400
      });

      setResponse(result);
      onResult?.(result);
      toast.success('AI response received');
    } catch (error) {
      console.error('Error asking AI:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="ai-prompt" className="block text-sm font-medium mb-2">
          Ask your AI writing coach
        </label>
        <Textarea
          id="ai-prompt"
          placeholder="Ask for writing advice, feedback, or suggestions..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="min-h-[80px]"
        />
      </div>

      <Button 
        onClick={handleAskAI} 
        disabled={isLoading || !prompt.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Thinking...
          </>
        ) : (
          'Ask AI'
        )}
      </Button>

      {response && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <h4 className="font-medium mb-2 text-sm">AI Writing Coach:</h4>
          <div 
            className="text-sm leading-relaxed"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoach;