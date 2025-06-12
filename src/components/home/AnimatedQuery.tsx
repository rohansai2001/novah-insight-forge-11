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
  return <div className="relative cursor-pointer group min-h-[60px] flex items-center justify-center bg-slate-800/30 border border-slate-600/30 rounded-xl p-4 hover:border-emerald-400/50 transition-all duration-300" onClick={() => onQueryClick(queries[currentQueryIndex])}>
      <div className="text-lg text-slate-300 text-center leading-relaxed">
        {displayedText}
        <span className="animate-pulse ml-1 text-emerald-400">|</span>
      </div>
      
      
    </div>;
};
export default AnimatedQuery;