
import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘'],
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚'],
  },
  {
    name: 'Objects',
    emojis: ['📚', '🔍', '💡', '✏️', '📝', '📌', '📎', '📊', '📈', '📉', '📅', '📆', '🔒', '🔓', '📱'],
  },
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8 hover:bg-secondary/80 bg-transparent text-muted-foreground hover:text-foreground transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open emoji picker"
      >
        <Smile className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 glass rounded-xl p-2 shadow-lg z-10 animate-fade-in">
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
            {EMOJI_CATEGORIES.map((category) => (
              <div key={category.name} className="mb-2">
                <h3 className="text-xs font-medium text-muted-foreground mb-1 px-2">{category.name}</h3>
                <div className="grid grid-cols-7 gap-1">
                  {category.emojis.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      className={cn(
                        "h-8 w-8 p-0 text-base hover:bg-secondary/80 rounded-md transition-colors",
                      )}
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
