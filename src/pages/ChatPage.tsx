
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { aiService } from '@/services/aiService';
import ThinkingStream from '@/components/chat/ThinkingStream';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import MindMap from '@/components/MindMap';

interface ThinkingStep {
  id: number;
  type: 'file_processing' | 'planning' | 'searching' | 'learning' | 'reflection' | 'replanning' | 'answer_generation';
  title: string;
  content: string;
  status: 'processing' | 'complete' | 'pending';
  data?: any;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showThinking, setShowThinking] = useState(true);
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [showMindMap, setShowMindMap] = useState(false);

  const { query, files, deepResearch } = location.state || {};

  useEffect(() => {
    if (!query) {
      navigate('/');
      return;
    }

    processInitialQuery();
  }, [query, files, deepResearch]);

  const processInitialQuery = async () => {
    setIsLoading(true);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages([userMessage]);

    try {
      const result = await aiService.processResearch(query, files || [], deepResearch);
      
      setThinkingSteps(result.thinkingSteps);
      setMindMapData(result.mindMap);
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response.content,
        timestamp: new Date(),
        sources: result.response.sources
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Research processing failed:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your research request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUp = async (followUpQuery: string) => {
    setIsLoading(true);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: followUpQuery,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const context = messages
        .filter(m => m.type === 'assistant')
        .map(m => m.content)
        .join('\n\n');
      
      const result = await aiService.processFollowUp(followUpQuery, context, files || []);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response.content,
        timestamp: new Date(),
        sources: result.response.sources
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Follow-up processing failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMindMapNodeExpand = async (nodeId: string) => {
    try {
      const expandedMap = await aiService.expandMindMapNode(nodeId, mindMapData, query);
      setMindMapData(expandedMap);
    } catch (error) {
      console.error('Mind map expansion failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="h-6 w-px bg-slate-600"></div>
              <h1 className="text-xl font-semibold text-white">Deep Research Session</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowThinking(!showThinking)}
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
              >
                {showThinking ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showThinking ? 'Hide Thinking' : 'Show Thinking'}
              </Button>
              
              {mindMapData && (
                <Button
                  variant="outline"
                  onClick={() => setShowMindMap(!showMindMap)}
                  className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
                >
                  {showMindMap ? 'Hide Mind Map' : 'View Mind Map'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className={`grid gap-6 transition-all duration-500 ${
          showMindMap ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}>
          {/* Main Chat Area */}
          <div className="space-y-6">
            {/* Thinking Process */}
            <ThinkingStream 
              steps={thinkingSteps} 
              isVisible={showThinking}
            />
            
            {/* Chat Messages */}
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                />
              ))}
              
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-300">Processing your request...</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <ChatInput
              onSendMessage={handleFollowUp}
              isLoading={isLoading}
              placeholder="Ask a follow-up question or request additional analysis..."
            />
          </div>
          
          {/* Mind Map */}
          {showMindMap && mindMapData && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Interactive Knowledge Map</h3>
              <div className="h-96 bg-slate-900/50 rounded border border-slate-600/30">
                <MindMap 
                  data={mindMapData}
                  onNodeExpand={handleMindMapNodeExpand}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
