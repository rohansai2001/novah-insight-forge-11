
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Upload, FileText, Trash2, ArrowRight, Sparkles } from 'lucide-react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setShowTypewriter(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      icon: "📊",
      gradient: "from-violet-600 via-purple-600 to-blue-600"
    },
    {
      title: "Technical Research",
      prompt: "Provide a comprehensive technical overview and implementation details for",
      icon: "⚙️",
      gradient: "from-blue-600 via-cyan-600 to-teal-600"
    },
    {
      title: "Industry Impact",
      prompt: "Examine the industry impact and future implications of",
      icon: "🚀",
      gradient: "from-orange-600 via-pink-600 to-red-600"
    }
  ];

  const handleSuggestionClick = (prompt: string) => {
    setQuery(prompt + " ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-5xl space-y-12 fade-in-up">
          {/* Main Title */}
          <div className="text-center space-y-6">
            <div className="relative">
              <h1 
                className={`text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent transition-all duration-500 hover:scale-105 ${
                  query.length > 0 ? 'animate-pulse-glow' : ''
                }`}
                style={{
                  filter: `drop-shadow(0 0 ${20 + (query.length * 2)}px rgba(139, 69, 255, 0.6))`
                }}
              >
                Novah
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent opacity-50 blur-sm text-8xl md:text-9xl font-bold animate-pulse">
                Novah
              </div>
            </div>
            
            <div 
              className={`text-2xl md:text-3xl text-slate-300 transition-all duration-700 ${
                query.length > 0 ? 'opacity-60 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {showTypewriter && (
                <span className="relative">
                  <span className="typewriter-text">An Advanced AI Agent</span>
                  <span className="typewriter-cursor">|</span>
                </span>
              )}
            </div>
          </div>

          {/* Query Input Area */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-2xl blur-sm opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="relative">
                  <Textarea
                    placeholder="Enter your research query..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-32 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 text-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl backdrop-blur-sm"
                    maxLength={1000}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                    {query.length}/1000
                  </div>
                </div>
                
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={deepResearch}
                        onCheckedChange={setDeepResearch}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-purple-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {deepResearch ? 'Deep Research' : 'Normal Mode'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {deepResearch ? 'Comprehensive analysis' : 'Quick insights'}
                        </span>
                      </div>
                    </div>
                    
                    <label className="cursor-pointer group">
                      <input
                        type="file"
                        multiple
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button variant="outline" className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 hover:border-purple-500 transition-all duration-300 group-hover:scale-105">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
                    </label>
                  </div>
                  
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Research
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-sm opacity-25"></div>
              <Card className="relative bg-slate-900/90 backdrop-blur-xl border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-400" />
                    Uploaded Files ({uploadedFiles.length}/2)
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeAllFiles}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove All
                  </Button>
                </div>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <span className="text-white">{file.name}</span>
                        <span className="text-xs text-slate-400 px-2 py-1 bg-slate-700 rounded">
                          {file.type.toUpperCase()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Suggestion Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {suggestionCards.map((card, index) => (
              <Card
                key={index}
                className={`cursor-pointer group relative overflow-hidden border-0 hover:scale-105 transition-all duration-500`}
                onClick={() => handleSuggestionClick(card.prompt)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
                <div className="relative p-6 text-white">
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <h3 className="font-bold text-xl mb-3 group-hover:text-yellow-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {card.prompt}...
                  </p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
