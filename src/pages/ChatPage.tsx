
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronDown, Brain, Send, Map, X, Upload, Trash2, FileText, CheckCircle, Loader } from 'lucide-react';
import MindMap from '@/components/MindMap';
import { toast } from '@/hooks/use-toast';
import ThinkingProcess from '@/components/chat/ThinkingProcess';
import StreamingText from '@/components/chat/StreamingText';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  files?: any[];
  thinking?: ThinkingStep[];
  sources?: string[];
  timestamp: Date;
}

interface ThinkingStep {
  id: number;
  type: 'planning' | 'researching' | 'sources' | 'analyzing' | 'replanning' | 'file_processing';
  title: string;
  content: string;
  status: 'processing' | 'complete' | 'pending';
}

interface UploadedFile {
  id: string;
  name: string;
  content: string;
  type: string;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<ThinkingStep[]>([]);
  const [showMindMap, setShowMindMap] = useState(false);
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [originalQuery, setOriginalQuery] = useState('');

  useEffect(() => {
    if (location.state) {
      const { query, files, deepResearch } = location.state;
      setOriginalQuery(query);
      handleInitialQuery(query, files, deepResearch);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleInitialQuery = async (query: string, files: any[], deepResearch: boolean) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      files,
      timestamp: new Date()
    };

    setMessages([userMessage]);
    await processResearchQuery(query, files, deepResearch);
  };

  const processResearchQuery = async (query: string, files: any[], deepResearch: boolean) => {
    setIsProcessing(true);
    setStreamingContent('');

    try {
      const formData = new FormData();
      formData.append('query', query);
      formData.append('deepResearch', deepResearch.toString());
      
      files.forEach((file: any) => {
        if (file instanceof File) {
          formData.append('files', file);
        }
      });

      const response = await fetch('http://localhost:3001/api/research', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to get research response');
      }

      const data = await response.json();
      
      // Set thinking steps
      setCurrentThinking(data.thinkingSteps);
      
      // Simulate step-by-step completion
      for (let i = 0; i < data.thinkingSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurrentThinking(prev => 
          prev.map((step, index) => 
            index <= i ? { ...step, status: 'complete' } : step
          )
        );
      }

      // Start streaming response
      setStreamingContent(data.response.content);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response.content,
        thinking: data.thinkingSteps,
        sources: data.response.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setMindMapData(data.mindMap);
      setCurrentThinking([]);

    } catch (error) {
      console.error('Error processing research:', error);
      toast({
        title: "Error",
        description: "Failed to process research query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setStreamingContent('');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && uploadedFiles.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await fetch('http://localhost:3001/api/followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: newMessage,
          context: messages.map(m => m.content).join('\n'),
          files: uploadedFiles
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get follow-up response');
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response.content,
        thinking: data.response.thinkingSteps,
        sources: data.response.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Add new node to mind map if relevant
      if (mindMapData && newMessage.length > 10) {
        const newNodeId = `followup_${Date.now()}`;
        const newNode = {
          id: newNodeId,
          label: newMessage.substring(0, 20) + '...',
          type: 'sub',
          level: 2,
          parentId: 'center',
          expanded: false,
          hasChildren: false
        };
        
        setMindMapData(prev => ({
          nodes: [...prev.nodes, newNode],
          edges: [...prev.edges, { source: 'center', target: newNodeId }]
        }));
      }

    } catch (error) {
      console.error('Error sending follow-up:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }

    setNewMessage('');
    setUploadedFiles([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: e.target?.result as string,
          type: '.' + file.name.split('.').pop()?.toLowerCase()
        };
        setUploadedFiles(prev => [...prev, newFile]);
      };
      reader.readAsText(file);
    });
  };

  const generateMindMap = () => {
    if (!mindMapData) {
      toast({
        title: "No Data",
        description: "Complete a research query first to generate mind map.",
        variant: "destructive"
      });
      return;
    }
    setShowMindMap(true);
  };

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-effect border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 
            className="text-3xl font-light gradient-text cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            Novah
          </h1>
          
          <div className="flex items-center space-x-4">
            {mindMapData && !showMindMap && (
              <Button
                onClick={generateMindMap}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Map className="h-4 w-4 mr-2" />
                Generate Mind Map
              </Button>
            )}
            {showMindMap && (
              <Button
                variant="outline"
                onClick={() => setShowMindMap(false)}
                className="glass-effect border-gray-600/50 text-white hover:bg-gray-700/50"
              >
                <X className="h-4 w-4 mr-2" />
                Hide Mind Map
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)] relative">
        {/* Chat Area */}
        <div className={`chat-container ${showMindMap ? 'w-1/2' : 'w-full'} flex flex-col`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`message-fade-in ${message.type === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                  <Card className={`max-w-3xl p-6 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white ml-auto glass-effect border border-purple-500/20' 
                      : 'glass-effect text-white border-gray-700/50'
                  }`}>
                    {message.type === 'user' ? (
                      <div className="space-y-3">
                        <p className="text-lg leading-relaxed">{message.content}</p>
                        {message.files && message.files.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm opacity-80">Attached Files:</p>
                            {message.files.map((file, index) => (
                              <div key={index} className="flex items-center space-x-2 bg-white/10 p-3 rounded-lg">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {message.thinking && (
                          <ThinkingProcess steps={message.thinking} isVisible={true} />
                        )}
                        
                        <div className="prose prose-invert max-w-none">
                          <StreamingText content={message.content} />
                        </div>
                        
                        {message.sources && (
                          <div className="border-t border-gray-700/50 pt-4 mt-6">
                            <h4 className="font-medium text-purple-400 mb-3">Sources:</h4>
                            <ul className="space-y-2">
                              {message.sources.map((source, index) => (
                                <li key={index} className="text-sm">
                                  <a 
                                    href={source} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-gray-300 hover:text-purple-400 transition-colors hover:underline"
                                  >
                                    {source}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              ))}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="max-w-3xl">
                    <ThinkingProcess steps={currentThinking} isVisible={true} />
                    {streamingContent && (
                      <Card className="glass-effect text-white border-gray-700/50 mt-4 p-6">
                        <StreamingText content={streamingContent} />
                      </Card>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-gray-700/50 glass-effect">
            <div className="max-w-4xl mx-auto">
              {uploadedFiles.length > 0 && (
                <div className="mb-4 space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between glass-effect p-3 rounded-lg border border-gray-600/30">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-purple-400" />
                        <span className="text-white text-sm">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex space-x-3">
                <Input
                  placeholder="Ask a follow-up question..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1 bg-gray-700/30 border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 input-border"
                />

                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="glass-effect border-gray-600/50 text-white hover:bg-gray-700/50">
                    <Upload className="h-4 w-4" />
                  </Button>
                </label>

                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && uploadedFiles.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mind Map */}
        {showMindMap && (
          <div className="mind-map-container w-1/2 border-l border-gray-700/50">
            <div className="h-full flex flex-col glass-effect">
              <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                <h3 className="text-white font-medium">Research Mind Map</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMindMap(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <MindMap data={mindMapData} query={originalQuery} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
