
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Message, useChatContext } from '@/context/ChatContext';
import { CheckCheck, Check } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { currentUser, isDarkMode } = useChatContext();
  const isCurrentUser = message.sender.id === currentUser.id;
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Add small delay to trigger animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const renderMessageStatus = () => {
    if (!isCurrentUser) return null;
    
    switch (message.status) {
      case 'sending':
        return (
          <div className="text-muted-foreground/60 text-xs">Sending...</div>
        );
      case 'sent':
        return (
          <Check className="h-3.5 w-3.5 text-muted-foreground/80" />
        );
      case 'delivered':
        return (
          <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/80" />
        );
      case 'read':
        return (
          <CheckCheck className="h-3.5 w-3.5 text-primary" />
        );
      default:
        return null;
    }
  };

  const formatMessageText = (text: string) => {
    if (message.isFormatted) {
      return <div dangerouslySetInnerHTML={{ __html: text }} />;
    }
    
    if (message.mentions && message.mentions.length > 0) {
      // Handle mentions in the text
      let lastIndex = 0;
      const parts = [];
      const sortedMentions = [...message.mentions].sort((a, b) => a.startIndex - b.startIndex);
      
      sortedMentions.forEach((mention, index) => {
        // Add text before mention
        if (mention.startIndex > lastIndex) {
          parts.push(
            <React.Fragment key={`text-${index}`}>
              {text.substring(lastIndex, mention.startIndex)}
            </React.Fragment>
          );
        }
        
        // Add mention
        parts.push(
          <span 
            key={`mention-${index}`}
            className="inline-block bg-primary/20 text-primary-foreground px-1 rounded-md font-medium"
          >
            @{mention.username}
          </span>
        );
        
        lastIndex = mention.startIndex + mention.username.length + 1; // +1 for @
      });
      
      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(
          <React.Fragment key="text-end">
            {text.substring(lastIndex)}
          </React.Fragment>
        );
      }
      
      return (
        <div>
          {parts.map((part, i) => (
            <React.Fragment key={i}>{part}</React.Fragment>
          ))}
        </div>
      );
    }
    
    // Regular text with line breaks
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const timestamp = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(message.timestamp);

  return (
    <div
      className={cn(
        'flex w-full mb-4 transition-opacity duration-300 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        isCurrentUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[70%] flex flex-col',
          isCurrentUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl py-2.5 px-4',
            'glass-card animate-scale-in shadow-sm',
            isCurrentUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm'
          )}
        >
          <div className="text-sm sm:text-base whitespace-pre-wrap break-words">
            {formatMessageText(message.text)}
          </div>
        </div>
        
        <div className="flex items-center mt-1 space-x-1.5 text-xs text-muted-foreground">
          <span>{timestamp}</span>
          {renderMessageStatus()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
