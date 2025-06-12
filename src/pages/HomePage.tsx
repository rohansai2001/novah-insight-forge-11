
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Upload, FileText, Trash2, ArrowRight, Sparkles, Star, Zap, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AnimatedQuery from '@/components/home/AnimatedQuery';

interface UploadedFile {
  id: string;
  name: string;
  content: string;
  type: string;
  file: File;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [deepResearch, setDeepResearch] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const animatedQueries = [
    "Analyze market trends in renewable energy sector",
    "Research the impact of AI on healthcare innovation",
    "Explore blockchain applications in supply chain",
    "Investigate quantum computing breakthrough potential"
  ];

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
          type: fileExtension,
          file: file
        };
        setUploadedFiles(prev => [...prev, newFile]);
        toast({
          title: "File Uploaded",
          description: `${file.name} has been successfully uploaded.`,
        });
      };
      reader.readAsText(file);
    });

    // Reset input
    event.target.value = '';
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
    toast({
      title: "File Removed",
      description: "File has been removed from the upload list.",
    });
  };

  const handleSubmit = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a research query.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
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
      prompt: "Analyze current market trends and competitive landscape for",
      icon: <Target className="h-8 w-8" />,
      gradient: "from-emerald-600 via-teal-600 to-cyan-600"
    },
    {
      title: "Technical Research", 
      prompt: "Provide comprehensive technical overview and implementation for",
      icon: <Zap className="h-8 w-8" />,
      gradient: "from-amber-600 via-orange-600 to-red-600"
    },
    {
      title: "Innovation Impact",
      prompt: "Examine industry impact and future implications of",
      icon: <Star className="h-8 w-8" />,
      gradient: "from-violet-600 via-purple-600 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 6}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-6xl space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <div className="relative">
              <h1 className="text-7xl md:text-8xl font-light bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-glow mb-6">
                Novah
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
                Advanced AI Research Assistant
              </p>
            </div>
          </div>

          {/* Animated Query Examples */}
          <div className="max-w-3xl mx-auto">
            <AnimatedQuery 
              queries={animatedQueries}
              onQueryClick={(selectedQuery) => setQuery(selectedQuery)}
            />
          </div>

          {/* Main Input Card */}
          <Card className="glass-effect p-8 border-0 shadow-2xl max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="relative">
                <Textarea
                  placeholder="Enter your research query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-32 bg-gray-700/30 border border-gray-600/50 text-white placeholder-gray-400 text-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl backdrop-blur-sm"
                  maxLength={1000}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {query.length}/1000
                </div>
              </div>
              
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={deepResearch}
                      onCheckedChange={setDeepResearch}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-white font-medium">
                        {deepResearch ? 'Deep Research' : 'Quick Research'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {deepResearch ? 'Comprehensive analysis' : 'Fast insights'}
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
                    <Button 
                      variant="outline" 
                      className="glass-effect border-gray-600/50 text-white hover:bg-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group-hover:scale-105"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </label>
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start Research
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card className="glass-effect border-0 p-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-400" />
                  Uploaded Files ({uploadedFiles.length}/2)
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFiles([])}
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between glass-effect p-4 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <span className="text-white">{file.name}</span>
                      <span className="text-xs text-gray-400 px-2 py-1 bg-white/10 rounded">
                        {file.type.toUpperCase()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Suggestion Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {suggestionCards.map((card, index) => (
              <Card
                key={index}
                className="cursor-pointer group relative overflow-hidden border-0 hover:scale-105 transition-all duration-500 glass-effect"
                onClick={() => setQuery(card.prompt + " ")}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-15 transition-opacity duration-500`}></div>
                <div className="relative p-6 text-white">
                  <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-3 group-hover:text-purple-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {card.prompt}...
                  </p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">
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
