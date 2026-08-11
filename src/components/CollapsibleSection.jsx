import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-dark-border rounded-lg bg-dark-card overflow-hidden my-3 transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-dark-hover text-left font-semibold text-sm hover:text-white transition-colors border-0 hover:cursor-pointer text-dark-text"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-dark-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-dark-muted" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-dark-border bg-dark-bg/40 text-sm text-dark-text leading-relaxed animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
