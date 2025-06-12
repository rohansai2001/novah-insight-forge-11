
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, FileText, Brain, Search, CheckCircle, Map } from 'lucide-react';
import MindMap from '@/components/MindMap';

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

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<ThinkingStep[]>([]);
  const [showMindMap, setShowMindMap] = useState(false);
  const [mindMapData, setMindMapData] = useState<any>(null);

  useEffect(() => {
    if (location.state) {
      const { query, files, deepResearch } = location.state;
      handleInitialQuery(query, files, deepResearch);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const simulateAIResponse = async (query: string, files: any[], deepResearch: boolean) => {
    setIsThinking(true);
    
    const thinkingSteps: ThinkingStep[] = [
      { step: "Analyzing Query", status: "processing", details: "Understanding the research intent and scope..." },
      { step: "Processing Files", status: "analyzing", details: "Extracting and analyzing uploaded documents..." },
      { step: "Planning Research", status: "analyzing", details: "Determining optimal research strategy..." },
      { step: "Web Search", status: "analyzing", details: "Gathering information from reliable sources..." },
      { step: "Source Validation", status: "analyzing", details: "Verifying source credibility and relevance..." },
      { step: "Information Synthesis", status: "analyzing", details: "Combining findings into coherent response..." }
    ];

    if (deepResearch) {
      thinkingSteps.push(
        { step: "Deep Analysis", status: "analyzing", details: "Conducting comprehensive research analysis..." },
        { step: "Cross-referencing", status: "analyzing", details: "Validating findings across multiple sources..." }
      );
    }

    setCurrentThinking(thinkingSteps);

    // Simulate step-by-step thinking process
    for (let i = 0; i < thinkingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
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

    // Generate AI response
    const aiResponse = generateAIResponse(query, deepResearch);
    const sources = [
      "https://example.com/research-source-1",
      "https://example.com/research-source-2",
      "https://example.com/research-source-3"
    ];

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: aiResponse,
      thinking: thinkingSteps.map(step => ({ ...step, status: 'complete' })),
      sources,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsThinking(false);
    
    // Generate mind map data
    generateMindMapData(query);
  };

  const generateAIResponse = (query: string, deepResearch: boolean) => {
    if (deepResearch) {
      return `# Comprehensive Research Analysis: ${query}

## Executive Summary
Based on extensive research and analysis, here are the key findings regarding ${query}. This comprehensive study examines multiple perspectives and provides actionable insights.

## Key Findings
1. **Primary Analysis**: Detailed examination reveals significant trends and patterns that indicate...
2. **Secondary Research**: Cross-referencing multiple sources confirms that...
3. **Market Implications**: The research suggests that the current landscape shows...

## Detailed Analysis
### Technical Aspects
The technical implementation involves several critical components that must be considered...

### Market Dynamics
Current market conditions show a clear trend toward...

### Future Projections
Based on the gathered data, we can project that...

## Recommendations
1. Immediate actions to consider
2. Medium-term strategic planning
3. Long-term implications and preparations

## Sources and Validation
All findings have been cross-referenced with multiple reliable sources to ensure accuracy and completeness.`;
    } else {
      return `# Research Summary: ${query}

## Key Insights
Based on the research conducted, here are the main findings regarding ${query}:

1. **Overview**: The topic shows significant relevance in current discussions...
2. **Main Points**: Key aspects include...
3. **Implications**: This research suggests that...

## Summary
The analysis indicates that ${query} is an important topic with several key considerations. The research provides a solid foundation for understanding the core concepts and their practical applications.

## Next Steps
Further research could explore specific aspects in more detail.`;
    }
  };

  const generateMindMapData = (query: string) => {
    const mindMapNodes = [
      { id: 'center', label: query, type: 'center' },
      { id: 'research', label: 'Research Methods', type: 'main' },
      { id: 'findings', label: 'Key Findings', type: 'main' },
      { id: 'implications', label: 'Implications', type: 'main' },
      { id: 'sources', label: 'Sources', type: 'main' }
    ];

    const mindMapEdges = [
      { source: 'center', target: 'research' },
      { source: 'center', target: 'findings' },
      { source: 'center', target: 'implications' },
      { source: 'center', target: 'sources' }
    ];

    setMindMapData({ nodes: mindMapNodes, edges: mindMapEdges });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-600 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 
            className="text-3xl font-bold gradient-text cursor-pointer glow-shadow"
            onClick={() => navigate('/')}
          >
            Novah
          </h1>
          <Button
            variant="outline"
            onClick={() => setShowMindMap(!showMindMap)}
            className="bg-transparent border-slate-600 text-white hover:bg-slate-700"
          >
            <Map className="h-4 w-4 mr-2" />
            {showMindMap ? 'Hide' : 'Show'} Mind Map
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Chat Area */}
        <div className={`${showMindMap ? 'w-1/2' : 'w-full'} flex flex-col`}>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <Card className={`max-w-2xl p-6 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto' 
                      : 'bg-slate-800/80 text-white border-slate-600'
                  }`}>
                    {message.type === 'user' ? (
                      <div className="space-y-3">
                        <p className="text-lg">{message.content}</p>
                        {message.files && message.files.length > 0 && (
                          <div className="space-y-2">
                            {message.files.map((file, index) => (
                              <div key={index} className="flex items-center space-x-2 bg-white/10 p-2 rounded">
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
                            <CollapsibleTrigger className="flex items-center space-x-2 text-blue-400 hover:text-blue-300">
                              <Brain className="h-4 w-4" />
                              <span>Thinking Process</span>
                              <ChevronDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3 space-y-2">
                              {message.thinking.map((step, index) => (
                                <div key={index} className="flex items-center space-x-3 p-2 bg-slate-700/50 rounded">
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <div>
                                    <div className="font-medium">{step.step}</div>
                                    <div className="text-sm text-slate-400">{step.details}</div>
                                  </div>
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                        
                        <div className="prose prose-invert max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} />
                        </div>
                        
                        {message.sources && (
                          <div className="border-t border-slate-600 pt-3">
                            <h4 className="font-medium text-blue-400 mb-2">Sources:</h4>
                            <ul className="space-y-1">
                              {message.sources.map((source, index) => (
                                <li key={index} className="text-sm text-slate-400">
                                  <a href={source} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
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
                  <Card className="max-w-2xl p-6 bg-slate-800/80 text-white border-slate-600">
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex items-center space-x-2 text-blue-400 hover:text-blue-300">
                        <Brain className="h-4 w-4 animate-pulse" />
                        <span>Thinking...</span>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-2">
                        {currentThinking.map((step, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-slate-700/50 rounded">
                            {step.status === 'complete' ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : step.status === 'processing' ? (
                              <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <div className="h-4 w-4 border-2 border-slate-500 rounded-full" />
                            )}
                            <div>
                              <div className="font-medium">{step.step}</div>
                              <div className="text-sm text-slate-400">{step.details}</div>
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Mind Map */}
        {showMindMap && (
          <div className="w-1/2 border-l border-slate-600">
            <MindMap data={mindMapData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
