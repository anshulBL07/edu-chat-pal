
import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Bold, Italic, List, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatContext } from '@/context/ChatContext';
import EmojiPicker from './EmojiPicker';

const MAX_MESSAGE_LENGTH = 1000;

const MessageInput: React.FC = () => {
  const { sendMessage } = useChatContext();
  const [message, setMessage] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);
  const [html, setHtml] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }

    // Handle shortcuts
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      applyFormat('bold');
    } else if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      applyFormat('italic');
    } else if (e.key === '/' && message === '') {
      // Show commands when typing "/"
      setMessage('/');
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (message.startsWith('/help')) {
      // Handle help command
      sendMessage(
        "Available commands:\n/help - Show this help message\n/bold [text] - Bold text\n/italic [text] - Italic text\n/list - Create a list",
        true
      );
    } else if (isFormatting) {
      // Send formatted message
      sendMessage(html, true);
    } else {
      // Send regular message
      sendMessage(message);
    }
    
    setMessage('');
    setHtml('');
    setIsFormatting(false);
  };

  const applyFormat = (format: 'bold' | 'italic' | 'list' | 'link') => {
    setIsFormatting(true);
    
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    const textarea = inputRef.current;
    
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    let formattedText = '';
    let insertText = '';
    
    switch (format) {
      case 'bold':
        insertText = `<strong>${selectedText || 'bold text'}</strong>`;
        break;
      case 'italic':
        insertText = `<em>${selectedText || 'italic text'}</em>`;
        break;
      case 'list':
        insertText = `<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>`;
        break;
      case 'link':
        insertText = `<a href="https://example.com">${selectedText || 'link text'}</a>`;
        break;
    }
    
    formattedText = text.substring(0, start) + insertText + text.substring(end);
    setMessage(formattedText);
    setHtml(formattedText);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = inputRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.substring(0, start) + emoji + message.substring(end);
    
    setMessage(newMessage);
    
    // Set cursor position after the inserted emoji
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const characterCount = message.length;
  const isOverLimit = characterCount > MAX_MESSAGE_LENGTH;

  return (
    <div className="glass border rounded-2xl p-3 transition-all duration-300 focus-within:shadow-md">
      <div className="flex items-center space-x-1 mb-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md"
          onClick={() => applyFormat('bold')}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md"
          onClick={() => applyFormat('italic')}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md"
          onClick={() => applyFormat('list')}
          aria-label="List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md"
          onClick={() => applyFormat('link')}
          aria-label="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <div className="flex-grow"></div>
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
      </div>
      
      <div className="relative">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="w-full resize-none outline-none bg-transparent p-2 min-h-[40px] max-h-32 text-sm sm:text-base scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent"
          style={{ overflow: 'auto' }}
        />
        
        <div className="absolute right-2 bottom-2 flex items-center space-x-2">
          <div className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
            {characterCount}/{MAX_MESSAGE_LENGTH}
          </div>
          
          <Button
            type="button"
            onClick={handleSendMessage}
            disabled={!message.trim() || isOverLimit}
            size="icon"
            className="rounded-full h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
            aria-label="Send message"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
