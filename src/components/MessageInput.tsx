
import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Bold, Italic, List, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatContext } from '@/context/ChatContext';
import EmojiPicker from './EmojiPicker';
import UserMention from './UserMention';
import { Mention } from '@/context/ChatContext';

const MAX_MESSAGE_LENGTH = 1000;

const MessageInput: React.FC = () => {
  const { sendMessage, users } = useChatContext();
  const [message, setMessage] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);
  const [html, setHtml] = useState('');
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [mentionFilter, setMentionFilter] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [lastMentionStart, setLastMentionStart] = useState(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const getCaretCoordinates = () => {
    const input = inputRef.current;
    if (!input) return { top: 0, left: 0 };

    const { offsetLeft, offsetTop, selectionEnd, scrollTop } = input;
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.height = 'auto';
    div.style.width = `${input.offsetWidth}px`;
    div.style.fontSize = window.getComputedStyle(input).fontSize;
    div.style.fontFamily = window.getComputedStyle(input).fontFamily;
    div.style.lineHeight = window.getComputedStyle(input).lineHeight;
    div.style.paddingLeft = window.getComputedStyle(input).paddingLeft;
    div.style.paddingRight = window.getComputedStyle(input).paddingRight;
    
    const text = input.value.substring(0, selectionEnd);
    div.textContent = text;
    
    document.body.appendChild(div);
    const { height, width } = div.getBoundingClientRect();
    document.body.removeChild(div);
    
    // Calculate position relative to input
    return {
      top: offsetTop - scrollTop + height + 15, // Add some padding
      left: offsetLeft + width + 10, // Add some padding
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showMentions) {
        // Don't send message when mention dropdown is open
        return;
      }
      handleSendMessage();
    }

    // Handle navigation in mention dropdown
    if (showMentions) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentions(false);
      }
      return;
    }

    // Handle shortcuts
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      applyFormat('bold');
    } else if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      applyFormat('italic');
    } else if (e.key === '@') {
      const input = inputRef.current;
      if (input) {
        const pos = getCaretCoordinates();
        setMentionPosition(pos);
        setLastMentionStart(input.selectionStart);
        setMentionFilter('');
        setShowMentions(true);
      }
    } else if (e.key === '/' && message === '') {
      // Show commands when typing "/"
      setMessage('/');
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // Check for active mention (@)
    if (showMentions && inputRef.current) {
      const cursorPos = inputRef.current.selectionStart;
      
      // Extract text between @ and cursor
      if (lastMentionStart >= 0 && cursorPos > lastMentionStart) {
        const mentionText = newValue.substring(lastMentionStart + 1, cursorPos);
        setMentionFilter(mentionText);
      } else {
        // If cursor moved before @, close mention dropdown
        setShowMentions(false);
      }
    }
  };

  const handleSelectMention = (user: User | null) => {
    if (!user) {
      setShowMentions(false);
      return;
    }
    
    const input = inputRef.current;
    if (!input || lastMentionStart < 0) return;
    
    const cursorPos = input.selectionStart;
    const beforeMention = message.substring(0, lastMentionStart);
    const afterMention = message.substring(cursorPos);
    const newMessage = `${beforeMention}@${user.name} ${afterMention}`;
    
    // Add to mentions array
    const newMention: Mention = {
      userId: user.id,
      username: user.name,
      startIndex: lastMentionStart,
      endIndex: lastMentionStart + user.name.length + 1, // +1 for @
    };
    
    setMentions(prev => [...prev, newMention]);
    setMessage(newMessage);
    setShowMentions(false);
    
    // Set cursor position after the mention
    setTimeout(() => {
      input.focus();
      const newCursorPos = lastMentionStart + user.name.length + 2; // +2 for @ and space
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
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
      sendMessage(html, true, mentions.length > 0 ? mentions : undefined);
    } else {
      // Send regular message
      sendMessage(message, false, mentions.length > 0 ? mentions : undefined);
    }
    
    setMessage('');
    setHtml('');
    setIsFormatting(false);
    setMentions([]);
    setShowMentions(false);
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
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Use @ to mention someone)"
          rows={1}
          className="w-full resize-none outline-none bg-transparent p-2 min-h-[40px] max-h-32 text-sm sm:text-base scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent"
          style={{ overflow: 'auto' }}
        />
        
        {showMentions && (
          <UserMention 
            users={users}
            filter={mentionFilter}
            onSelect={handleSelectMention}
            position={mentionPosition}
            inputRef={inputRef}
          />
        )}
        
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
