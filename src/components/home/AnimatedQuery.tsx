
import React, { useState, useEffect } from 'react';

interface AnimatedQueryProps {
  queries: string[];
  onQueryClick: (query: string) => void;
}

const AnimatedQuery = ({
  queries,
  onQueryClick
}: AnimatedQueryProps) => {
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    const currentQuery = queries[currentQueryIndex];
    if (isTyping && currentCharIndex < currentQuery.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + currentQuery[currentCharIndex]);
        setCurrentCharIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    } else if (isTyping && currentCharIndex >= currentQuery.length) {
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (!isTyping) {
      const timer = setTimeout(() => {
        setDisplayedText('');
        setCurrentCharIndex(0);
        setCurrentQueryIndex(prev => (prev + 1) % queries.length);
        setIsTyping(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQueryIndex, currentCharIndex, isTyping, queries]);

  return (
    <div 
      className="relative cursor-pointer group p-6 rounded-xl glass-effect border border-slate-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
      onClick={() => onQueryClick(queries[currentQueryIndex])}
    >
      <div className="text-center">
        <p className="text-lg text-gray-300 mb-2">Try asking:</p>
        <div className="min-h-[60px] flex items-center justify-center">
          <span className="text-xl text-white font-medium">
            "{displayedText}"
            {isTyping && (
              <span className="inline-block w-0.5 h-6 bg-blue-400 animate-pulse ml-1"></span>
            )}
          </span>
        </div>
        <p className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to use this query
        </p>
      </div>
    </div>
  );
};

export default AnimatedQuery;
