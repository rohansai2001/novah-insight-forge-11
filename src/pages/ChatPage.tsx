
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, FileText, Brain, Send, Map, X, Sparkles, Search, CheckCircle, Upload, Trash2 } from 'lucide-react';
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
  const [isThinking, setIsThinking] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<ThinkingStep[]>([]);
  const [showMindMap, setShowMindMap] = useState(false);
  const [mindMapGenerated, setMindMapGenerated] = useState(false);
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [deepResearch, setDeepResearch] = useState(false);

  useEffect(() => {
    if (location.state) {
      const { query, files, deepResearch: isDeepResearch } = location.state;
      setDeepResearch(isDeepResearch);
      handleInitialQuery(query, files, isDeepResearch);
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
    await simulateAIResponse(query, files, deepResearch);
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
    setNewMessage('');
    setUploadedFiles([]);
    
    await simulateAIResponse(newMessage, uploadedFiles, deepResearch);
  };

  const simulateAIResponse = async (query: string, files: any[], deepResearch: boolean) => {
    setIsThinking(true);
    setStreamingResponse('');
    
    const thinkingSteps: ThinkingStep[] = [
      { step: "Analyzing Query", status: "processing", details: "Understanding the research intent and scope..." },
    ];

    if (files && files.length > 0) {
      thinkingSteps.push(
        { step: "Processing Files", status: "analyzing", details: "Extracting and analyzing uploaded documents..." },
        { step: "RAG Implementation", status: "analyzing", details: "Implementing retrieval-augmented generation on file content..." }
      );
    }

    thinkingSteps.push(
      { step: "Planning Research", status: "analyzing", details: "Determining optimal research strategy..." },
      { step: "Web Search", status: "analyzing", details: "Gathering information from reliable sources..." },
      { step: "Source Validation", status: "analyzing", details: "Verifying source credibility and relevance..." }
    );

    if (deepResearch) {
      thinkingSteps.push(
        { step: "Deep Analysis", status: "analyzing", details: "Conducting comprehensive research analysis..." },
        { step: "Cross-referencing", status: "analyzing", details: "Validating findings across multiple sources..." },
        { step: "Synthesis", status: "analyzing", details: "Creating comprehensive whitepaper-style analysis..." }
      );
    } else {
      thinkingSteps.push(
        { step: "Information Synthesis", status: "analyzing", details: "Combining findings into coherent response..." }
      );
    }

    setCurrentThinking(thinkingSteps);

    // Simulate step-by-step thinking process
    for (let i = 0; i < thinkingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
      
      setCurrentThinking(prev => 
        prev.map((step, index) => 
          index === i 
            ? { ...step, status: 'complete' }
            : index < i 
              ? { ...step, status: 'complete' }
              : step
        )
      );
    }

    // Generate streaming response
    const fullResponse = generateAIResponse(query, deepResearch, files);
    setIsThinking(false);
    
    // Simulate streaming
    for (let i = 0; i <= fullResponse.length; i += 2) {
      setStreamingResponse(fullResponse.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    const sources = [
      "https://research.example.com/ai-trends-2024",
      "https://tech.example.com/emerging-technologies", 
      "https://academic.example.com/comprehensive-study"
    ];

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: fullResponse,
      thinking: thinkingSteps.map(step => ({ ...step, status: 'complete' })),
      sources,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setStreamingResponse('');
    
    // Generate mind map data for the first response or new queries
    if (!mindMapGenerated || query.length > 20) {
      generateMindMapData(query);
      setMindMapGenerated(true);
    } else {
      // Add new node for follow-up questions
      addNodeToMindMap(query);
    }
  };

  const generateAIResponse = (query: string, deepResearch: boolean, files?: any[]) => {
    const hasFiles = files && files.length > 0;
    
    if (deepResearch) {
      return `# Comprehensive Research Analysis: ${query}

## Executive Summary
${hasFiles ? 'Based on extensive analysis of your uploaded documents and ' : 'Based on '}comprehensive research, here are the key findings regarding ${query}. This deep-dive analysis examines multiple perspectives and provides actionable insights.

## Key Findings
1. **Primary Analysis**: Detailed examination reveals significant trends and patterns indicating substantial growth and innovation in this domain.

2. **Market Dynamics**: Current landscape shows accelerated adoption rates with emerging players disrupting traditional approaches.

3. **Technical Implementation**: Core technologies demonstrate robust scalability with several breakthrough innovations on the horizon.

## Detailed Analysis

### Current State Assessment
The research indicates a rapidly evolving ecosystem with strong fundamentals. Key stakeholders are investing heavily in next-generation solutions.

### Future Projections
Based on gathered data and trend analysis, we project significant expansion over the next 3-5 years with breakthrough applications emerging.

### Strategic Recommendations
1. **Immediate Actions**: Focus on foundational capabilities and strategic partnerships
2. **Medium-term Planning**: Develop scalable infrastructure and user experience
3. **Long-term Vision**: Position for emerging opportunities and technological convergence

## Sources and Validation
All findings cross-referenced with multiple authoritative sources to ensure accuracy and completeness.`;
    } else {
      return `# Research Summary: ${query}

## Key Insights
${hasFiles ? 'Based on your uploaded files and additional ' : 'Based on '}research conducted, here are the main findings:

**Overview**: This topic shows significant relevance in current discussions with strong growth indicators and emerging opportunities.

**Main Points**: 
- Core concepts demonstrate solid market validation
- Implementation approaches are becoming more standardized  
- Future outlook remains positive with continued innovation

**Practical Applications**: The research suggests several viable implementation strategies with proven success metrics.

## Summary
The analysis indicates ${query} represents an important area with substantial potential. Current trends support continued development and adoption.

## Next Steps
Further exploration of specific implementation details would provide additional value for strategic planning.`;
    }
  };

  const generateMindMapData = (query: string) => {
    const mindMapNodes = [
      { id: 'center', label: query.substring(0, 20) + '...', type: 'center' },
      { id: 'research', label: 'Research Methods', type: 'main' },
      { id: 'findings', label: 'Key Findings', type: 'main' },
      { id: 'implications', label: 'Implications', type: 'main' },
      { id: 'sources', label: 'Sources', type: 'main' },
      { id: 'analysis1', label: 'Market Analysis', type: 'sub' },
      { id: 'analysis2', label: 'Technical Review', type: 'sub' },
      { id: 'future1', label: 'Future Trends', type: 'sub' },
      { id: 'future2', label: 'Recommendations', type: 'sub' }
    ];

    const mindMapEdges = [
      { source: 'center', target: 'research' },
      { source: 'center', target: 'findings' },
      { source: 'center', target: 'implications' },
      { source: 'center', target: 'sources' },
      { source: 'findings', target: 'analysis1' },
      { source: 'findings', target: 'analysis2' },
      { source: 'implications', target: 'future1' },
      { source: 'implications', target: 'future2' }
    ];

    setMindMapData({ nodes: mindMapNodes, edges: mindMapEdges });
  };

  const addNodeToMindMap = (query: string) => {
    if (!mindMapData) return;
    
    const newNodeId = `followup_${Date.now()}`;
    const newNode = { 
      id: newNodeId, 
      label: query.substring(0, 15) + '...', 
      type: 'sub' 
    };
    
    setMindMapData(prev => ({
      nodes: [...prev.nodes, newNode],
      edges: [...prev.edges, { source: 'center', target: newNodeId }]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (uploadedFiles.length + files.length > 2) {
      toast({
        title: "File Limit Exceeded",
        description: "You can only upload up to 2 files.",
        variant: "destructive"
      });
      return;
    }

    Array.from(files).forEach(file => {
      const allowedTypes = ['.txt', '.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid File Type", 
          description: "Please upload only txt, pdf, doc, or docx files.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: e.target?.result as string,
          type: fileExtension
        };
        setUploadedFiles(prev => [...prev, newFile]);
      };
      reader.readAsText(file);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 
            className="text-4xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            Novah
          </h1>
          
          <div className="flex items-center space-x-4">
            {mindMapGenerated && (
              <Button
                variant="outline"
                onClick={() => setShowMindMap(!showMindMap)}
                className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 hover:border-purple-500 transition-all"
              >
                <Map className="h-4 w-4 mr-2" />
                {showMindMap ? 'Hide Mind Map' : 'Show Mind Map'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)] relative">
        {/* Chat Area */}
        <div className={`transition-all duration-300 ease-in-out ${showMindMap ? 'w-1/2' : 'w-full'} flex flex-col`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <Card className={`max-w-3xl p-6 message-content ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-auto' 
                      : 'bg-slate-800/90 text-white border-slate-700/50 backdrop-blur-sm'
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
                                <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                  {file.type?.toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {message.thinking && (
                          <Collapsible defaultOpen className="thinking-container">
                            <CollapsibleTrigger className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                              <Brain className="h-4 w-4" />
                              <span>Thinking Process</span>
                              <ChevronDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3 space-y-2">
                              {message.thinking.map((step, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <div>
                                    <div className="font-medium text-white">{step.step}</div>
                                    <div className="text-sm text-slate-300">{step.details}</div>
                                  </div>
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                        
                        <div className="prose prose-invert max-w-none">
                          <div 
                            className="whitespace-pre-wrap leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                              __html: message.content.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, '<strong>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                            }} 
                          />
                        </div>
                        
                        {message.sources && (
                          <div className="border-t border-slate-600/50 pt-4">
                            <h4 className="font-medium text-blue-400 mb-3 flex items-center">
                              <Search className="h-4 w-4 mr-2" />
                              Sources:
                            </h4>
                            <ul className="space-y-2">
                              {message.sources.map((source, index) => (
                                <li key={index} className="text-sm">
                                  <a 
                                    href={source} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-slate-300 hover:text-blue-400 transition-colors hover:underline"
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

              {isThinking && (
                <div className="flex justify-start">
                  <Card className="max-w-3xl p-6 bg-slate-800/90 text-white border-slate-700/50 backdrop-blur-sm thinking-container">
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex items-center space-x-2 text-blue-400 hover:text-blue-300">
                        <Brain className="h-4 w-4 animate-pulse" />
                        <span>Thinking...</span>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-2">
                        {currentThinking.map((step, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
                            {step.status === 'complete' ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : step.status === 'processing' ? (
                              <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <div className="h-4 w-4 border-2 border-slate-500 rounded-full" />
                            )}
                            <div>
                              <div className="font-medium text-white">{step.step}</div>
                              <div className="text-sm text-slate-300">{step.details}</div>
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
                  <Card className="max-w-3xl p-6 bg-slate-800/90 text-white border-slate-700/50 backdrop-blur-sm streaming-text">
                    <div className="prose prose-invert max-w-none">
                      <div 
                        className="whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: streamingResponse.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, '<strong>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                        }} 
                      />
                      <span className="inline-block w-2 h-5 bg-blue-400 animate-pulse ml-1"></span>
                    </div>
                  </Card>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto">
              {uploadedFiles.length > 0 && (
                <div className="mb-4 space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <span className="text-white text-sm">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Ask a follow-up question..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700">
                    <Upload className="h-4 w-4" />
                  </Button>
                </label>

                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && uploadedFiles.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>

                {mindMapGenerated && !showMindMap && (
                  <Button
                    onClick={() => setShowMindMap(true)}
                    variant="outline"
                    className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mind Map */}
        {showMindMap && (
          <div className="mind-map-container">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <h3 className="text-white font-medium">Mind Map</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMindMap(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <MindMap data={mindMapData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
