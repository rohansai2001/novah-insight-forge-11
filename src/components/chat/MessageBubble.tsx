
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import ThinkingProcess from './ThinkingProcess';
import StreamingText from './StreamingText';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  files?: any[];
  thinking?: any[];
  sources?: string[];
  timestamp: Date;
}

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <Card className="max-w-3xl p-6 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 text-white ml-auto border border-emerald-500/30 backdrop-blur-sm">
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
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <Card className="max-w-3xl bg-slate-800/50 text-white border border-slate-700/50 backdrop-blur-sm p-6">
        <div className="space-y-4">
          {message.thinking && (
            <ThinkingProcess steps={message.thinking} isVisible={true} />
          )}
          
          <div className="prose prose-invert max-w-none">
            <StreamingText content={message.content} />
          </div>
          
          {message.sources && (
            <div className="border-t border-slate-700/50 pt-4 mt-6">
              <h4 className="font-medium text-cyan-400 mb-3">Sources:</h4>
              <ul className="space-y-2">
                {message.sources.map((source, index) => (
                  <li key={index} className="text-sm">
                    <a 
                      href={source} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-slate-300 hover:text-cyan-400 transition-colors hover:underline"
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MessageBubble;
