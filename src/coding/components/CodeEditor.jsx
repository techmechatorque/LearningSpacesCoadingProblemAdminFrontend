import React, { useEffect, useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { workspaceStore } from '../workspace-engine/store/WorkspaceStore';
import { workspaceEventService } from '../workspace-engine/services/EventService';
import { workspaceCommandService } from '../workspace-engine/services/CommandService';
import './CodeEditor.css';

const CodeEditor = ({ instanceId, params = {} }) => {
  const {
    problemDetail: problem,
    language, setLanguage,
    executeCode,
    executionLoading: loading,
    code: globalCode, setCode: setGlobalCode
  } = useWorkspace();

  // For multi-instance, we look at params.file, otherwise default to "main"
  const fileName = params.file || 'main';
  const editorRef = useRef(null);

  const [cooldown, setCooldown] = useState(0);
  const [localCode, setLocalCode] = useState('');

  // 1. Setup instance in store
  useEffect(() => {
    if (instanceId) {
      workspaceStore.updateInstance(instanceId, { 
        type: 'editor',
        file: fileName,
        code: localCode
      });
    }
  }, [instanceId, fileName]);

  // 2. Cooldown timer for run/submit
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // 3. Load initial code
  useEffect(() => {
    if (problem) {
      const savedCode = localStorage.getItem(`tmt_code_${problem._id}_${language}_${fileName}`);
      let initialCode = '';
      
      if (savedCode !== null) {
        initialCode = savedCode;
      } else {
        const starter = problem.starterCode?.[language];
        if (starter && fileName === 'main') {
          initialCode = starter;
        } else {
          switch (language) {
            case 'cpp': initialCode = '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}'; break;
            case 'java': initialCode = 'public class Main {\n    public static void main(String[] args) {\n    }\n}'; break;
            case 'python': initialCode = '# Write your code here\n'; break;
            case 'c': default: initialCode = '// Write your code here\n'; break;
          }
        }
      }
      setLocalCode(initialCode);
      if (fileName === 'main') setGlobalCode(initialCode);
    }
  }, [problem, language, fileName, setGlobalCode]);

  // 4. Handle Editor Mounting (Expose commands)
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Listen to command events from the global platform
    const unsubFormat = workspaceEventService.on('editor.action.format', () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });

    return () => {
      unsubFormat();
    };
  };

  const handleCodeChange = (val) => {
    const newCode = val || '';
    setLocalCode(newCode);
    
    // Sync to platform state
    if (instanceId) {
      workspaceStore.updateInstance(instanceId, { code: newCode });
    }
    
    // Legacy sync
    if (fileName === 'main') {
      setGlobalCode(newCode);
    }
    
    if (problem?._id) {
      localStorage.setItem(`tmt_code_${problem._id}_${language}_${fileName}`, newCode);
    }
  };

  const handleRun = async () => {
    if (cooldown > 0 || loading) return;
    setCooldown(5);
    await executeCode(false); // false = Run
    workspaceCommandService.focusPanel('testresults');
  };

  const handleSubmit = async () => {
    if (!problem || cooldown > 0 || loading) return;
    setCooldown(5);
    await executeCode(true); // true = Submit
    workspaceCommandService.focusPanel('testresults');
  };

  return (
    <div className="coding-editor-wrapper code-editor-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="coding-editor-toolbar">
        <div className="code-editor-lang-selector">
          <span className="code-editor-lang-label">Language:</span>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="code-editor-select">
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="c">C</option>
          </select>
        </div>
        <div className="code-editor-actions">
          <button className="coding-btn coding-btn-outline code-editor-btn" onClick={handleRun} disabled={loading || cooldown > 0}>
            <Play className="workspace-icon-xs" /> {cooldown > 0 ? `Wait ${cooldown}s` : 'Run'}
          </button>
          <button className="coding-btn coding-btn-primary code-editor-btn" onClick={handleSubmit} disabled={loading || cooldown > 0}>
            <Send className="workspace-icon-xs" /> {cooldown > 0 ? `Wait ${cooldown}s` : 'Submit'}
          </button>
        </div>
      </div>

      <div className="code-editor-monaco-wrapper" style={{ flex: 1, position: 'relative' }}>
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'python' ? 'python' : 'c'}
          theme="vs-dark"
          value={localCode}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 12 }, fontFamily: "monospace" }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
