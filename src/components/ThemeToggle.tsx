
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatContext } from '@/context/ChatContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useChatContext();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="rounded-full h-8 w-8 bg-secondary/50 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform duration-200 rotate-0 scale-100" />
      )}
    </Button>
  );
};

export default ThemeToggle;
