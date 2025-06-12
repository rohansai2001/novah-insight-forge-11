
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Upload, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import SuggestionCards from '@/components/home/SuggestionCards';
import FileUploadArea from '@/components/home/FileUploadArea';

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

    event.target.value = '';
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-float"
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
              <h1 className="text-7xl md:text-8xl font-light bg-gradient-to-r from-red-500 via-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent animate-glow mb-6">
                Novah
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 mb-8 font-light">
                Transparent AI Research Co-Pilot
              </p>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Upload your documents, ask your questions, and watch the AI research process unfold in real-time
              </p>
            </div>
          </div>

          {/* Main Input Card */}
          <Card className="bg-slate-800/40 border-2 border-slate-600/50 backdrop-blur-sm p-8 shadow-2xl max-w-4xl mx-auto hover:border-cyan-500/30 transition-all duration-300">
            <div className="space-y-6">
              <div className="relative">
                <Textarea
                  placeholder="Enter your research query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-32 bg-slate-700/50 border-2 border-slate-600/70 text-white placeholder-slate-400 text-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 rounded-xl backdrop-blur-sm transition-all duration-300"
                  maxLength={1000}
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                  {query.length}/1000
                </div>
              </div>
              
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={deepResearch}
                      onCheckedChange={setDeepResearch}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-cyan-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-white font-medium">
                        {deepResearch ? 'Deep Research' : 'Normal Research'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {deepResearch ? '500 words, 5 queries' : '200 words, 2 queries'}
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
                      className="bg-slate-700/50 border-2 border-slate-600/70 text-white hover:bg-slate-700/70 hover:border-cyan-500/50 transition-all duration-300 group-hover:scale-105"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Context Files
                    </Button>
                  </label>
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Initiating Research...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start Deep Research
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Uploaded Files */}
          <FileUploadArea 
            uploadedFiles={uploadedFiles}
            onFilesChange={setUploadedFiles}
          />

          {/* Suggestion Cards */}
          <SuggestionCards onQuerySelect={setQuery} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
