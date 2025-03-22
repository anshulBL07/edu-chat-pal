
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type UserStatus = 'active' | 'idle' | 'offline';

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
  isTyping?: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: User;
  timestamp: Date;
  status: MessageStatus;
  isFormatted?: boolean;
}

interface ChatContextType {
  messages: Message[];
  currentUser: User;
  aiUser: User;
  sendMessage: (text: string, isFormatted?: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAiTyping: boolean;
}

const LOCAL_STORAGE_THEME_KEY = 'edu-chat-theme';

const defaultUser: User = {
  id: 'user-1',
  name: 'You',
  avatar: '',
  status: 'active',
};

const aiUser: User = {
  id: 'ai-1',
  name: 'AI Tutor',
  avatar: '',
  status: 'active',
  isTyping: false,
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-message',
      text: "Welcome to the AI Educational Chat! I'm your AI tutor. How can I help you with your studies today?",
      sender: aiUser,
      timestamp: new Date(),
      status: 'read',
    },
  ]);
  const [currentUser] = useState<User>(defaultUser);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // AI response simulation for educational chat
  const simulateAIResponse = useCallback((userMessage: string) => {
    setIsAiTyping(true);
    
    // Simulate thinking time based on message length
    const thinkingTime = Math.max(1500, Math.min(userMessage.length * 50, 3000));
    
    setTimeout(() => {
      const responses = [
        "That's a great question! In this context, we should consider multiple perspectives...",
        "Let me explain this concept in detail. First, we need to understand the fundamental principles...",
        "I can help you with that. Here's a step-by-step approach to solve this problem...",
        "This topic is fascinating! Let's explore the key concepts together...",
        "Let's break this down into smaller parts to make it easier to understand..."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const newMessage: Message = {
        id: `ai-msg-${Date.now()}`,
        text: randomResponse,
        sender: aiUser,
        timestamp: new Date(),
        status: 'delivered',
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsAiTyping(false);
    }, thinkingTime);
  }, []);

  const sendMessage = useCallback((text: string, isFormatted = false) => {
    if (!text.trim()) return;
    
    const newMessage: Message = {
      id: `user-msg-${Date.now()}`,
      text,
      sender: currentUser,
      timestamp: new Date(),
      status: 'sending',
      isFormatted,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate message being sent and delivered
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' } 
            : msg
        )
      );
      
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'delivered' } 
              : msg
          )
        );
        
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'read' } 
                : msg
            )
          );
          
          // Now trigger AI response
          simulateAIResponse(text);
        }, 500);
      }, 500);
    }, 600);
  }, [currentUser, simulateAIResponse]);

  const value = {
    messages,
    currentUser,
    aiUser,
    sendMessage,
    isDarkMode,
    toggleDarkMode,
    isAiTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
