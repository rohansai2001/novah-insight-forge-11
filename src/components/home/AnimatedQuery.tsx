
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
      }, 80);
      return () => clearTimeout(timer);
    } else if (isTyping && currentCharIndex >= currentQuery.length) {
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 2500);
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
      className="relative cursor-pointer group min-h-[120px] flex items-center justify-center" 
      onClick={() => onQueryClick(queries[currentQueryIndex])}
    >
      <div className="glass-effect p-8 rounded-2xl border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300 transform group-hover:scale-105 w-full max-w-2xl">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-3">Try asking about:</p>
          <div className="text-xl text-white font-light min-h-[60px] flex items-center justify-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {displayedText}
              <span className="streaming-cursor">|</span>
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-3">Click to use this query</p>
        </div>
      </div>
    </div>
  );
};

export default AnimatedQuery;
