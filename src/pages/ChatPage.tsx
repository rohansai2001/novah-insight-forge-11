
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Brain, Send, Map, X, Upload, Trash2, FileText, CheckCircle, Loader } from 'lucide-react';
import MindMap from '@/components/MindMap';
import { toast } from '@/hooks/use-toast';

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
  step: string;
  status: 'analyzing' | 'complete' | 'processing';
  details: string;
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
  const [streamingResponse, setStreamingResponse] = useState('');
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
  }, [messages, streamingResponse]);

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
    setStreamingResponse('');

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
      
      // Simulate streaming response
      const steps = data.response.thinkingSteps;
      setCurrentThinking(steps);
      
      // Simulate step-by-step thinking
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentThinking(prev => 
          prev.map((step, index) => 
            index <= i ? { ...step, status: 'complete' } : step
          )
        );
      }

      // Stream the response
      const fullResponse = data.response.content;
      for (let i = 0; i <= fullResponse.length; i += 3) {
        setStreamingResponse(fullResponse.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: fullResponse,
        thinking: steps,
        sources: data.response.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setMindMapData(data.mindMap);
      setStreamingResponse('');
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
      <div className="sticky top-0 z-40 glass-effect border-b border-white/10 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 
            className="text-4xl font-bold gradient-text cursor-pointer hover:scale-105 transition-transform"
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
                className="glass-effect border-white/20 text-white hover:bg-white/10"
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
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white ml-auto glass-effect' 
                      : 'glass-effect text-white border-white/10'
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
                          <Collapsible defaultOpen>
                            <CollapsibleTrigger className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors">
                              <Brain className="h-4 w-4" />
                              <span>Thinking Process</span>
                              <ChevronDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3 space-y-2">
                              {message.thinking.map((step, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 glass-effect rounded-lg">
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <div>
                                    <div className="font-medium text-white">{step.step}</div>
                                    <div className="text-sm text-gray-300">{step.details}</div>
                                  </div>
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                        
                        <div className="prose prose-invert max-w-none">
                          <div 
                            className="whitespace-pre-wrap leading-relaxed text-gray-100"
                            dangerouslySetInnerHTML={{ 
                              __html: message.content.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, '<strong>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                            }} 
                          />
                        </div>
                        
                        {message.sources && (
                          <div className="border-t border-white/10 pt-4">
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
                  <Card className="max-w-3xl p-6 glass-effect text-white border-white/10">
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex items-center space-x-2 text-purple-400">
                        <Brain className="h-4 w-4 animate-pulse" />
                        <span>Processing...</span>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-2">
                        {currentThinking.map((step, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 glass-effect rounded-lg thinking-step">
                            {step.status === 'complete' ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <Loader className="h-4 w-4 text-purple-400 animate-spin" />
                            )}
                            <div>
                              <div className="font-medium text-white">{step.step}</div>
                              <div className="text-sm text-gray-300">{step.details}</div>
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </div>
              )}

              {streamingResponse && (
                <div className="flex justify-start">
                  <Card className="max-w-3xl p-6 glass-effect text-white border-white/10">
                    <div className="prose prose-invert max-w-none">
                      <div 
                        className="whitespace-pre-wrap leading-relaxed text-gray-100"
                        dangerouslySetInnerHTML={{ 
                          __html: streamingResponse.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, '<strong>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                        }} 
                      />
                      <span className="inline-block w-2 h-5 bg-purple-400 streaming-cursor ml-1"></span>
                    </div>
                  </Card>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-white/10 glass-effect">
            <div className="max-w-4xl mx-auto">
              {uploadedFiles.length > 0 && (
                <div className="mb-4 space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between glass-effect p-3 rounded-lg">
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
                  className="flex-1 glass-effect border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />

                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="glass-effect border-white/20 text-white hover:bg-white/10">
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
          <div className="mind-map-container w-1/2 border-l border-white/10">
            <div className="h-full flex flex-col glass-effect">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
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
