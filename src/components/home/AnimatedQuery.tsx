
import React, { useState, useEffect } from 'react';

interface AnimatedQueryProps {
  queries: string[];
  onQueryClick: (query: string) => void;
}

const AnimatedQuery = ({ queries, onQueryClick }: AnimatedQueryProps) => {
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
        setCurrentQueryIndex((prev) => (prev + 1) % queries.length);
        setIsTyping(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQueryIndex, currentCharIndex, isTyping, queries]);

  return (
    <div 
      className="relative cursor-pointer group"
      onClick={() => onQueryClick(queries[currentQueryIndex])}
    >
      <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-600/30 rounded-xl p-4 hover:bg-gray-700/40 transition-all duration-300 group-hover:scale-105">
        <div className="text-gray-300 text-lg min-h-[28px] flex items-center">
          {displayedText}
          <span className="inline-block w-0.5 h-6 bg-purple-400 animate-pulse ml-1"></span>
        </div>
        <div className="text-sm text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to use this query
        </div>
      </div>
    </div>
  );
};

export default AnimatedQuery;
