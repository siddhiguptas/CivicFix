'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Lightbulb,
  FileText,
  ArrowRight,
  RefreshCw,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { authService, User as UserType } from '@/lib/auth';
import { chatbotService, ChatMessage, ChatResponse } from '@/lib/chatbot';
import { toast } from 'sonner';

export default function ChatbotPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentUser = authService.getCurrentUserSync();
    if (!currentUser) {
      return;
    }
    setUser(currentUser);

    // Load chat history with a small delay to ensure localStorage is available
    setTimeout(() => {
      try {
        const chatHistory = chatbotService.getChatHistory();
        console.log('Loaded chat history:', chatHistory);
        
        if (chatHistory && chatHistory.length > 0) {
          setMessages(chatHistory);
        } else {
          // Add welcome message if no history
          const welcomeMessage: ChatMessage = {
            id: 'welcome',
            message: `Hello ${currentUser.full_name}! I'm your AI assistant for Civic Connect. I can help you with reporting issues, tracking grievances, understanding the platform, and answering questions about civic services. How can I assist you today?`,
            sender: 'bot',
            timestamp: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Add welcome message on error
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          message: `Hello ${currentUser.full_name}! I'm your AI assistant for Civic Connect. I can help you with reporting issues, tracking grievances, understanding the platform, and answering questions about civic services. How can I assist you today?`,
          sender: 'bot',
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    }, 100);
  }, []);

  useEffect(() => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);
    
    // Scroll to bottom after adding user message
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    try {
      const response = await chatbotService.sendMessage({
        message: inputMessage.trim(),
        context: {
          user_role: user?.role
        }
      });

      console.log('Chatbot response:', response);

      // Simulate typing delay
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: response.reply || 'Sorry, I could not generate a response.',
          sender: 'bot',
          timestamp: new Date().toISOString(),
        };

        console.log('Bot message created:', botMessage);
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        setIsTyping(false);
        
        // Scroll to bottom after adding message
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }, 1000 + Math.random() * 1000); // 1-2 second delay

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Add error message to UI
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message. Please try again.');
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    chatbotService.clearChatHistory();
    setMessages([]);
    toast.success('Chat history cleared');
  };

  const quickActions = [
    {
      title: 'How to report an issue?',
      description: 'Learn how to report civic issues',
      action: 'How do I report a new civic issue?',
    },
    {
      title: 'Check my grievances',
      description: 'View status of my reports',
      action: 'Show me my recent grievances',
    },
    {
      title: 'What categories exist?',
      description: 'See available issue categories',
      action: 'What categories can I report issues under?',
    },
    {
      title: 'How to track progress?',
      description: 'Learn about status tracking',
      action: 'How can I track the progress of my reports?',
    },
  ];

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Assistant</h1>
              <p className="text-lg text-gray-600">
                Get instant help with reporting issues, tracking grievances, and understanding the platform
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" onClick={clearChat} className="hover:bg-red-50 hover:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Chat
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Chat Interface */}
          <div className="xl:col-span-3">
            <Card className="h-[700px] flex flex-col shadow-lg border-0 overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center text-xl">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">CivicConnect AI Assistant</div>
                    <div className="text-sm font-normal text-gray-600 mt-1">
                      Ask me anything about civic issues, reporting, or the platform
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
            
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <div className="space-y-6 min-h-full">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-1.5 rounded-full ${
                              message.sender === 'user' 
                                ? 'bg-blue-500' 
                                : 'bg-blue-100'
                            }`}>
                              {message.sender === 'bot' && (
                                <Bot className="h-4 w-4 text-blue-600" />
                              )}
                              {message.sender === 'user' && (
                                <User className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
                              <p className={`text-xs mt-2 ${
                                message.sender === 'user' 
                                  ? 'text-blue-100' 
                                  : 'text-gray-500'
                              }`}>
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white text-gray-900 rounded-2xl px-5 py-3 border border-gray-200 shadow-sm">
                          <div className="flex items-center space-x-3">
                            <div className="p-1.5 rounded-full bg-blue-100">
                              <Bot className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input */}
                <div className="border-t bg-white p-6">
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about civic issues, reporting, or the platform..."
                        disabled={isLoading}
                        className="pr-12 h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send • Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                  </div>
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-sm">
                  Common questions and actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 text-left hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{action.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{action.description}</div>
                    </div>
                    <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  Help Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Reporting Issues</Badge>
                  <Badge variant="outline" className="text-xs">Status Tracking</Badge>
                  <Badge variant="outline" className="text-xs">Categories</Badge>
                  <Badge variant="outline" className="text-xs">Location Services</Badge>
                  <Badge variant="outline" className="text-xs">Photo Upload</Badge>
                  <Badge variant="outline" className="text-xs">Account Settings</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Need More Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/grievances/new">
                    <FileText className="mr-2 h-4 w-4" />
                    Report New Issue
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/grievances">
                    <FileText className="mr-2 h-4 w-4" />
                    View My Reports
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}