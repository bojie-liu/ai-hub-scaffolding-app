'use client';

import { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Message } from '@/lib/types/debate';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ChatWindowProps {
  debateId: string;
  topic: string;
  stance: string;
}

export function ChatWindow({ debateId, topic, stance }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, [debateId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/debates/${debateId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);

    // Add user message optimistically
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      debateId,
      role: 'user',
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debateId, content, chatId: debateId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: data.messageId,
        debateId,
        role: 'assistant',
        content: data.message,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="text-center py-8">Loading debate...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{topic}</CardTitle>
        <CardDescription>AI Stance: {stance}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MessageList messages={messages} isLoading={isLoading} />
        <MessageInput onSend={handleSendMessage} disabled={isLoading} />
      </CardContent>
    </Card>
  );
}
