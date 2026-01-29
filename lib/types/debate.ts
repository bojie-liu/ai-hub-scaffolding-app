export interface Debate {
  id: string;
  topic: string;
  stance: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  debateId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface CreateDebateInput {
  topic: string;
  stance: string;
  description?: string;
}

export interface SendMessageInput {
  debateId: string;
  content: string;
}
