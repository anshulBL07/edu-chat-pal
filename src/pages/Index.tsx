
import React from 'react';
import { ChatProvider } from '@/context/ChatContext';
import ChatInterface from '@/components/ChatInterface';

const Index: React.FC = () => {
  return (
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  );
};

export default Index;
