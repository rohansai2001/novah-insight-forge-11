
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Send, Trash2, FileText } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  content: string;
  type: string;
  file: File;
}

interface ChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (id: string) => void;
  isProcessing: boolean;
}

const ChatInput = ({
  message,
  onMessageChange,
  onSendMessage,
  onFileUpload,
  uploadedFiles,
  onRemoveFile,
  isProcessing
}: ChatInputProps) => {
  return (
    <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        {uploadedFiles.length > 0 && (
          <div className="mb-4 space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-slate-700/30 border border-slate-600/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <span className="text-white text-sm">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(file.id)}
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
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSendMessage()}
            className="flex-1 bg-slate-700/30 border-2 border-slate-600/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 rounded-xl"
            disabled={isProcessing}
          />

          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept=".txt,.pdf,.doc,.docx"
              onChange={onFileUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              className="bg-slate-700/30 border-2 border-slate-600/50 text-white hover:bg-slate-700/50 hover:border-slate-500/70"
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </label>

          <Button 
            onClick={onSendMessage}
            disabled={(!message.trim() && uploadedFiles.length === 0) || isProcessing}
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
