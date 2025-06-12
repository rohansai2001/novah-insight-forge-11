
import React from 'react';
import { Card } from '@/components/ui/card';
import { Brain, TrendingUp, Search, BarChart } from 'lucide-react';

interface SuggestionCardsProps {
  onQuerySelect: (query: string) => void;
}

const SuggestionCards = ({ onQuerySelect }: SuggestionCardsProps) => {
  const suggestions = [
    {
      id: 1,
      icon: <Brain className="h-6 w-6 text-blue-400" />,
      title: "AI Technology Analysis",
      description: "Analyze current trends in artificial intelligence and machine learning",
      query: "Analyze the current state and future trends of artificial intelligence technology, including recent breakthroughs and market implications"
    },
    {
      id: 2,
      icon: <TrendingUp className="h-6 w-6 text-green-400" />,
      title: "Market Research",
      description: "Deep dive into market dynamics and competitive landscape",
      query: "Conduct comprehensive market research on renewable energy sector growth patterns and investment opportunities"
    },
    {
      id: 3,
      icon: <Search className="h-6 w-6 text-purple-400" />,
      title: "Industry Analysis",
      description: "Comprehensive industry analysis with competitive insights",
      query: "Research the impact of digital transformation on traditional banking industry and emerging fintech solutions"
    },
    {
      id: 4,
      icon: <BarChart className="h-6 w-6 text-orange-400" />,
      title: "Data-Driven Insights",
      description: "Extract actionable insights from complex data patterns",
      query: "Analyze consumer behavior patterns in e-commerce and their implications for business strategy"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-light text-white mb-4">Research Templates</h3>
        <p className="text-slate-400">Click any template to get started with expert-crafted research queries</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {suggestions.map((suggestion) => (
          <Card 
            key={suggestion.id}
            onClick={() => onQuerySelect(suggestion.query)}
            className="bg-slate-800/60 border border-slate-700/70 backdrop-blur-sm p-6 cursor-pointer hover:bg-slate-700/60 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transform hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-slate-700/50 rounded-full group-hover:bg-slate-600/50 transition-colors duration-300">
                {suggestion.icon}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-white text-lg group-hover:text-cyan-300 transition-colors duration-300">
                  {suggestion.title}
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {suggestion.description}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-600/50 w-full">
                <span className="text-xs text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
                  Click to use template →
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuggestionCards;
