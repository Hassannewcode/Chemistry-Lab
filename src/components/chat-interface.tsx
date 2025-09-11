
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="mt-4 border rounded-lg bg-gray-50 p-4 space-y-4">
        <h3 className="font-semibold text-sm text-center text-gray-700">Ask a follow-up question</h3>
        <ScrollArea className="h-48 w-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
            {messages.map((message, index) => (
                <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                {message.role === 'assistant' && (
                    <Avatar className="h-6 w-6">
                        <AvatarFallback><Bot size={14}/></AvatarFallback>
                    </Avatar>
                )}
                <div className={cn('max-w-xs md:max-w-md rounded-lg p-3 text-sm', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    <p>{message.content}</p>
                </div>
                {message.role === 'user' && (
                    <Avatar className="h-6 w-6">
                        <AvatarFallback><User size={14}/></AvatarFallback>
                    </Avatar>
                )}
                </div>
            ))}
            {isLoading && messages[messages.length-1]?.role === 'user' && (
                 <div className='flex items-start gap-3 justify-start'>
                    <Avatar className="h-6 w-6">
                        <AvatarFallback><Bot size={14}/></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
                    </div>
                </div>
            )}
            </div>
      </ScrollArea>
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Is this reaction dangerous?"
          disabled={isLoading}
        />
        <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} size="icon">
            <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
    