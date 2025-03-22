
import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import ThemeToggle from './ThemeToggle';
import { useChatContext } from '@/context/ChatContext';
import { CircleDot } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const { messages, isAiTyping, aiUser } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden transition-colors duration-300">
      <header className="glass sticky top-0 border-b z-20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative mr-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">AI</span>
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background"></span>
          </div>
          <div>
            <h1 className="font-medium">{aiUser.name}</h1>
            <div className="flex items-center text-xs text-muted-foreground">
              <CircleDot className="h-3 w-3 text-emerald-500 mr-1" />
              <span>Active now</span>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isAiTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-secondary/50 backdrop-blur-sm rounded-2xl py-2.5 px-4 animate-scale-in">
                <div className="flex space-x-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot-1"></span>
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot-2"></span>
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot-3"></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>
      
      <footer className="px-4 sm:px-6 pb-4 pt-2">
        <div className="max-w-3xl mx-auto">
          <MessageInput />
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
