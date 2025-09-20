import { api, API_ENDPOINTS } from './api';

// Types
export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
  context?: {
    grievance_id?: string;
    category?: string;
    location?: string;
  };
}

export interface ChatRequest {
  message: string;
  context?: {
    grievance_id?: string;
    category?: string;
    location?: string;
    user_role?: string;
  };
}

export interface ChatResponse {
  reply: string;
  message_id?: string | null;
  suggestions?: string[];
  related_grievances?: {
    id: string;
    title: string;
    status: string;
  }[];
  next_steps?: string[];
}

// Chatbot Service
export class ChatbotService {
  private static instance: ChatbotService;
  private chatHistory: ChatMessage[] = [];

  private constructor() {
    this.loadChatHistory();
  }

  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  // Load chat history from localStorage
  private loadChatHistory(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      const history = localStorage.getItem('chat_history');
      if (history) {
        const parsedHistory = JSON.parse(history);
        this.chatHistory = Array.isArray(parsedHistory) ? parsedHistory : [];
        console.log('Chatbot service loaded history:', this.chatHistory);
      } else {
        this.chatHistory = [];
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      this.chatHistory = [];
    }
  }

  // Save chat history to localStorage
  private saveChatHistory(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      localStorage.setItem('chat_history', JSON.stringify(this.chatHistory));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  // Send message to chatbot
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        message: request.message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        context: request.context,
      };
      this.chatHistory.push(userMessage);

      // Send to API
      const response = await api.post(API_ENDPOINTS.CHATBOT.CHAT, request);
      const botResponse: ChatResponse = response.data;
      
      console.log('API Response:', response.data);
      console.log('Bot Response:', botResponse);

      // Add bot response to history
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: botResponse.reply || 'Sorry, I could not generate a response.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        context: request.context,
      };
      
      console.log('Bot message for history:', botMessage);
      this.chatHistory.push(botMessage);

      // Save to localStorage
      this.saveChatHistory();

      return botResponse;
    } catch (error: unknown) {
      // Add error message to history
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        message: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        context: request.context,
      };
      this.chatHistory.push(errorMessage);
      this.saveChatHistory();

      throw new Error(error.response?.data?.detail || 'Failed to send message');
    }
  }

  // Get chat history
  getChatHistory(): ChatMessage[] {
    // Reload from localStorage to ensure we have the latest data
    this.loadChatHistory();
    return [...this.chatHistory];
  }

  // Clear chat history
  clearChatHistory(): void {
    this.chatHistory = [];
    this.saveChatHistory();
  }

  // Get recent messages
  getRecentMessages(limit: number = 10): ChatMessage[] {
    return this.chatHistory.slice(-limit);
  }

  // Add system message
  addSystemMessage(message: string): void {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      message,
      sender: 'bot',
      timestamp: new Date().toISOString(),
    };
    this.chatHistory.push(systemMessage);
    this.saveChatHistory();
  }

  // Get suggested questions based on context
  getSuggestedQuestions(context?: {
    grievance_id?: string;
    category?: string;
    location?: string;
  }): string[] {
    const baseQuestions = [
      'How do I report a new issue?',
      'What is the status of my complaint?',
      'How long does it take to resolve issues?',
      'What departments handle different types of issues?',
      'How can I track my submitted grievances?',
    ];

    if (context?.category) {
      const categoryQuestions = {
        'pothole': [
          'How do I report a pothole?',
          'What information do I need to provide?',
          'How long does pothole repair take?',
        ],
        'street_light': [
          'How do I report a broken street light?',
          'What should I do if a street light is not working?',
          'How long does street light repair take?',
        ],
        'garbage': [
          'How do I report garbage collection issues?',
          'What if my garbage is not being collected?',
          'How do I report overflowing bins?',
        ],
        'water': [
          'How do I report water supply issues?',
          'What if there is a water leak?',
          'How do I report water quality problems?',
        ],
      };

      const specificQuestions = categoryQuestions[context.category as keyof typeof categoryQuestions] || [];
      return [...specificQuestions, ...baseQuestions];
    }

    return baseQuestions;
  }

  // Format message for display
  formatMessage(message: ChatMessage): string {
    return message.message;
  }

  // Check if message is from user
  isUserMessage(message: ChatMessage): boolean {
    return message.sender === 'user';
  }

  // Check if message is from bot
  isBotMessage(message: ChatMessage): boolean {
    return message.sender === 'bot';
  }

  // Get message timestamp
  getMessageTimestamp(message: ChatMessage): string {
    return new Date(message.timestamp).toLocaleTimeString();
  }

  // Get message date
  getMessageDate(message: ChatMessage): string {
    return new Date(message.timestamp).toLocaleDateString();
  }
}

// Export singleton instance
export const chatbotService = ChatbotService.getInstance();
