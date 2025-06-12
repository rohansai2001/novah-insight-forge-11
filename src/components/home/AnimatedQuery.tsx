
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
      className="text-center cursor-pointer py-8 px-4"
      onClick={() => onQueryClick(displayedText)}
    >
      <div className="text-2xl md:text-3xl text-slate-300 font-light min-h-[80px] flex items-center justify-center">
        {displayedText}
        {isTyping && (
          <span className="animate-pulse text-cyan-400 ml-1">|</span>
        )}
      </div>
      <p className="text-sm text-slate-500 mt-2">
        Click to use this query
      </p>
    </div>
  );
};

export default AnimatedQuery;
