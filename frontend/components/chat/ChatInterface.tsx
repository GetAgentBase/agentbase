'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/api';
import apiClient from '@/lib/apiClient';
import { motion } from 'framer-motion';

interface ChatInterfaceProps {
  agentId: string;
  agentName: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agentId, agentName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load chat history when component mounts
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoading(true);
        const history = await apiClient.getChatHistory(agentId);
        setMessages(history.messages);
      } catch (err) {
        console.error('Error loading chat history:', err);
        setError('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChatHistory();
  }, [agentId]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to UI immediately
      const userMessagePreview: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: newMessage,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessagePreview]);
      setNewMessage('');
      
      // Send to API
      const response = await apiClient.sendChatMessage(agentId, newMessage);
      
      // Add agent response
      setMessages(prev => [...prev.filter(msg => msg.id !== userMessagePreview.id), 
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
        response
      ]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearChat = async () => {
    try {
      setIsLoading(true);
      await apiClient.clearChatHistory(agentId);
      setMessages([]);
    } catch (err) {
      console.error('Error clearing chat:', err);
      setError('Failed to clear chat history');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[600px] bg-panel rounded-md border border-panel-border">
      {/* Chat header */}
      <div className="flex justify-between items-center p-4 border-b border-panel-border">
        <h3 className="text-lg font-medium text-text-primary">Chat with {agentName}</h3>
        <button
          onClick={handleClearChat}
          className="text-xs text-text-secondary hover:text-text-primary"
          disabled={isLoading || messages.length === 0}
        >
          Clear Chat
        </button>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-secondary text-sm">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-text-primary'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSendMessage} className="border-t border-panel-border p-4">
        {error && <div className="text-error text-xs mb-2">{error}</div>}
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-l-md border border-r-0 border-input-border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-primary text-white rounded-r-md px-4 py-2 hover:bg-primary-dark disabled:opacity-50"
            disabled={isLoading || !newMessage.trim()}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;