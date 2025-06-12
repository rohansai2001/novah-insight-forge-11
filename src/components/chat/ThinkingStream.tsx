
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  FileText, 
  Target, 
  Search, 
  BookOpen, 
  CheckCircle, 
  Loader, 
  AlertCircle,
  Lightbulb,
  PenTool
} from 'lucide-react';

interface ThinkingStep {
  id: number;
  type: 'file_processing' | 'planning' | 'searching' | 'learning' | 'reflection' | 'replanning' | 'answer_generation';
  title: string;
  content: string;
  status: 'processing' | 'complete' | 'pending';
  data?: any;
}

interface ThinkingStreamProps {
  steps: ThinkingStep[];
  isVisible: boolean;
}

const getStepIcon = (type: string, status: string) => {
  const iconClass = "h-4 w-4";
  
  if (status === 'processing') {
    return <Loader className={`${iconClass} animate-spin text-blue-400`} />;
  }
  
  if (status === 'complete') {
    return <CheckCircle className={`${iconClass} text-green-400`} />;
  }

  switch (type) {
    case 'file_processing': return <FileText className={`${iconClass} text-cyan-400`} />;
    case 'planning': return <Target className={`${iconClass} text-blue-400`} />;
    case 'searching': return <Search className={`${iconClass} text-yellow-400`} />;
    case 'learning': return <BookOpen className={`${iconClass} text-green-400`} />;
    case 'reflection': return <Brain className={`${iconClass} text-purple-400`} />;
    case 'replanning': return <Lightbulb className={`${iconClass} text-pink-400`} />;
    case 'answer_generation': return <PenTool className={`${iconClass} text-emerald-400`} />;
    default: return <AlertCircle className={`${iconClass} text-gray-400`} />;
  }
};

const getStepColor = (type: string) => {
  switch (type) {
    case 'file_processing': return 'bg-cyan-500/10 border-cyan-500/30';
    case 'planning': return 'bg-blue-500/10 border-blue-500/30';
    case 'searching': return 'bg-yellow-500/10 border-yellow-500/30';
    case 'learning': return 'bg-green-500/10 border-green-500/30';
    case 'reflection': return 'bg-purple-500/10 border-purple-500/30';
    case 'replanning': return 'bg-pink-500/10 border-pink-500/30';
    case 'answer_generation': return 'bg-emerald-500/10 border-emerald-500/30';
    default: return 'bg-gray-500/10 border-gray-500/30';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'complete':
      return <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">Complete</Badge>;
    case 'processing':
      return <Badge variant="default" className="bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse">Processing</Badge>;
    case 'pending':
      return <Badge variant="outline" className="text-gray-400 border-gray-600">Pending</Badge>;
    default:
      return null;
  }
};

const ThinkingStream = ({ steps, isVisible }: ThinkingStreamProps) => {
  if (!isVisible || steps.length === 0) return null;

  return (
    <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="h-6 w-6 text-purple-400 animate-pulse" />
        <h3 className="text-xl font-semibold text-white">AI Thinking Process</h3>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`p-4 rounded-lg border ${getStepColor(step.type)} backdrop-blur-sm transition-all duration-300`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step.type, step.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white text-sm">{step.title}</h4>
                  {getStatusBadge(step.status)}
                </div>
                
                <p className="text-sm text-gray-300 leading-relaxed mb-3">
                  {step.content}
                </p>
                
                {/* Special rendering for different step types */}
                {step.type === 'planning' && step.data?.queries && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-blue-300 uppercase tracking-wide">Research Plan:</p>
                    <ol className="space-y-1">
                      {step.data.queries.map((query: any, index: number) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start">
                          <span className="text-blue-400 mr-2 flex-shrink-0">{index + 1}.</span>
                          <div>
                            <span className="font-medium">{query.query}</span>
                            <span className="text-gray-400 text-xs block">Purpose: {query.purpose}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {step.type === 'learning' && step.data?.source_url && (
                  <div className="mt-3 p-3 bg-slate-700/30 rounded border border-slate-600/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs font-medium text-green-300">Source Found</span>
                    </div>
                    <a 
                      href={step.data.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs underline mb-1 block"
                    >
                      {step.data.source_url}
                    </a>
                    <p className="text-xs text-gray-400">{step.data.summary}</p>
                  </div>
                )}
                
                {step.type === 'reflection' && step.data && (
                  <div className="mt-3 p-3 bg-purple-900/20 rounded border border-purple-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-3 w-3 text-purple-400" />
                      <span className="text-xs font-medium text-purple-300">Assessment Result</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={step.data.decision === 'sufficient' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {step.data.decision}
                      </Badge>
                      <span className="text-xs text-gray-400">{step.data.reason}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ThinkingStream;
