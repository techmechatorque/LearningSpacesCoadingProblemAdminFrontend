import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import './CollapsibleSection.css';

const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section-container">
      <button 
        className="collapsible-section-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown className="workspace-icon-md" /> : <ChevronRight className="workspace-icon-md" />}
      </button>
      {isOpen && (
        <div className="collapsible-section-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
