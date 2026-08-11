import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import './CodeEditor.css'; // Inheriting shared styles

const TestcasesPanel = () => {
  const { customTestCases, setCustomTestCases } = useWorkspace();
  const [activeCaseId, setActiveCaseId] = useState(null);

  useEffect(() => {
    if (customTestCases.length > 0 && !activeCaseId) {
      setActiveCaseId(customTestCases[0].id);
    } else if (customTestCases.length > 0 && !customTestCases.find(tc => tc.id === activeCaseId)) {
      setActiveCaseId(customTestCases[0].id);
    }
  }, [customTestCases, activeCaseId]);

  const handleAddCase = () => {
    if (customTestCases.length >= 7) return;
    const newId = Date.now();
    const newName = `Case ${customTestCases.length + 1}`;
    setCustomTestCases([...customTestCases, { id: newId, input: '', name: newName }]);
    setActiveCaseId(newId);
  };

  const handleRemoveCase = (e, idToRemove) => {
    e.stopPropagation();
    if (customTestCases.length <= 1) return;
    
    const newCases = customTestCases.filter(tc => tc.id !== idToRemove);
    // Rename remaining cases
    const renamedCases = newCases.map((tc, idx) => ({ ...tc, name: `Case ${idx + 1}` }));
    setCustomTestCases(renamedCases);
  };

  const handleInputChange = (e) => {
    setCustomTestCases(customTestCases.map(tc => 
      tc.id === activeCaseId ? { ...tc, input: e.target.value } : tc
    ));
  };

  const activeCase = customTestCases.find(tc => tc.id === activeCaseId) || customTestCases[0];

  return (
    <div className="coding-panel-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0' }}>
      <div className="code-editor-testcases-grid" style={{ padding: '8px 12px', borderBottom: '1px solid var(--coding-border)', margin: 0 }}>
        {customTestCases.map(tc => (
          <div key={tc.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button 
              onClick={() => setActiveCaseId(tc.id)} 
              className={`code-editor-tc-btn ${activeCaseId === tc.id ? 'selected' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {tc.name}
              {customTestCases.length > 1 && (
                <X size={14} className="hover:text-red-400" onClick={(e) => handleRemoveCase(e, tc.id)} />
              )}
            </button>
          </div>
        ))}
        {customTestCases.length < 7 && (
          <button onClick={handleAddCase} className="code-editor-tc-btn" style={{ padding: '4px 8px' }} title="Add Test Case">
            <Plus size={16} />
          </button>
        )}
      </div>
      {activeCase && (
        <textarea
          value={activeCase.input}
          onChange={handleInputChange}
          placeholder="Enter custom input test cases here..."
          className="code-editor-custom-input"
          style={{ flex: 1, border: 'none', borderRadius: 0, padding: '12px' }}
        />
      )}
    </div>
  );
};

export default TestcasesPanel;
