
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Upload, FileText, Trash2, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  content: string;
  type: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [deepResearch, setDeepResearch] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowTypewriter(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setGlowIntensity(query.length > 0 ? 1 : 0);
  }, [query]);

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

  const removeAllFiles = () => {
    setUploadedFiles([]);
  };

  const handleSubmit = () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a research query.",
        variant: "destructive"
      });
      return;
    }

    navigate('/chat', {
      state: {
        query,
        files: uploadedFiles,
        deepResearch
      }
    });
  };

  const suggestionCards = [
    {
      title: "Market Analysis",
      prompt: "Analyze the current market trends and competitive landscape for",
      color: "from-blue-600 to-purple-600"
    },
    {
      title: "Technical Research",
      prompt: "Provide a comprehensive technical overview and implementation details for",
      color: "from-purple-600 to-pink-600"
    },
    {
      title: "Industry Impact",
      prompt: "Examine the industry impact and future implications of",
      color: "from-pink-600 to-red-600"
    }
  ];

  const handleSuggestionClick = (prompt: string) => {
    setQuery(prompt + " ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-8 fade-in-up">
        {/* Main Title */}
        <div className="text-center space-y-4">
          <h1 
            className={`text-8xl font-bold gradient-text glow-shadow transition-all duration-300 ${
              query.length > 0 ? 'scale-105' : ''
            }`}
            style={{
              filter: `drop-shadow(0 0 ${20 + glowIntensity * 20}px rgba(59, 130, 246, 0.5))`
            }}
          >
            Novah
          </h1>
          
          <div 
            className={`text-2xl text-slate-300 transition-opacity duration-500 ${
              query.length > 0 ? 'opacity-70' : 'opacity-100'
            }`}
          >
            {showTypewriter && (
              <span className="typewriter border-r-2 border-blue-400">
                An Advanced AI Agent
              </span>
            )}
          </div>
        </div>

        {/* Query Input */}
        <div className="animated-border pulse-glow">
          <div className="animated-border-inner">
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your research query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-32 bg-transparent border-0 text-white placeholder-slate-400 text-lg resize-none focus:ring-0"
                maxLength={1000}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={deepResearch}
                      onCheckedChange={setDeepResearch}
                      className="data-[state=checked]:bg-red-600"
                    />
                    <span className="text-white font-medium">
                      {deepResearch ? 'Deep Research' : 'Normal Mode'}
                    </span>
                  </div>
                  
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" className="bg-transparent border-slate-600 text-white hover:bg-slate-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </label>
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white"
                >
                  <ArrowRight className="h-4 w-4 ml-2" />
                  Research
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-600 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">Uploaded Files</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeAllFiles}
                className="text-red-400 hover:text-red-300 hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove All
              </Button>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-white text-sm">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Suggestion Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {suggestionCards.map((card, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 bg-gradient-to-br ${card.color} p-6 border-0`}
              onClick={() => handleSuggestionClick(card.prompt)}
            >
              <h3 className="text-white font-semibold text-lg mb-2">{card.title}</h3>
              <p className="text-white/80 text-sm">{card.prompt}...</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
