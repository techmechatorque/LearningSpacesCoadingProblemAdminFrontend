import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Terminal, Clock, Code2, AlertTriangle, AlertCircle, CheckCircle2, ChevronLeft, Keyboard } from 'lucide-react';
import * as api from '../services/codingApi';
import '../styles/coding.css';
import './Compiler.css';

const STARTER_CODES = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Type your C++ code here\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  java: `// Main class name must match Main\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Type your Java code here\n        System.out.println("Hello, World!");\n    }\n}`,
  python: `# Type your Python code here\nprint("Hello, World!")`,
  c: `// Type your C code here\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`
};

const Compiler = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('c');
  const [codes, setCodes] = useState(STARTER_CODES);
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Resize split panel states
  const [editorWidth, setEditorWidth] = useState(55); // percentage for the editor panel
  const [isDraggingWidth, setIsDraggingWidth] = useState(false);

  const startResize = useCallback((e) => {
    setIsDraggingWidth(true);
    e.target.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isDraggingWidth) return;

    const handlePointerMove = (e) => {
      const container = document.getElementById('compiler-container');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      
      let newPercentage = (relativeX / containerRect.width) * 100;
      
      if (newPercentage < 20) newPercentage = 20;
      if (newPercentage > 80) newPercentage = 80;
      
      setEditorWidth(newPercentage);
    };

    const handlePointerUp = () => {
      setIsDraggingWidth(false);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingWidth]);

  const handleRun = async () => {
    if (cooldown > 0) return;
    setCooldown(5);
    setLoading(true);
    setRunResult(null);

    const activeCode = codes[language];

    try {
      const data = await api.runCode(null, activeCode, language, customInput);
      setRunResult(data);
    } catch (err) {
      setRunResult({
        status: 'Runtime Error',
        stderr: err.message || 'Execution failed',
        stdout: '',
        compileOutput: '',
        time: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (val) => {
    setCodes(prev => ({
      ...prev,
      [language]: val || ''
    }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Accepted': return 'status-accepted';
      case 'Compilation Error': return 'status-compilation-error';
      case 'Runtime Error':
      case 'Time Limit Exceeded':
      case 'Memory Limit Exceeded': return 'status-runtime-error';
      default: return 'status-default';
    }
  };

  return (
    <div className="coding-workspace compiler-layout">
      {/* Main Workspace split */}
      <div id="compiler-container" className="compiler-main-split">
        
        {/* Left Side: Code Editor */}
        <div className="compiler-editor-panel" style={{ width: `${editorWidth}%` }}>

          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'python' ? 'python' : 'c'}
            theme="vs-dark"
            value={codes[language]}
            onChange={handleCodeChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
            }}
          />
        </div>

        {/* Resizer Splitter Divider */}
        <div
          className={`compiler-resizer ${isDraggingWidth ? 'dragging' : ''}`}
          onPointerDown={startResize}
        />

        {/* Right Side: Input & Output Panel */}
        <div className="compiler-io-panel">
          {/* IO Header */}
          <div className="compiler-top-toolbar" style={{ borderBottom: '1px solid var(--coding-border)', padding: '0.75rem 1.5rem', background: 'var(--coding-bg)', justifyContent: 'flex-end' }}>
            <div className="compiler-toolbar-right">
              {/* Language Selector */}
              <div className="compiler-language-selector">
                <span className="compiler-language-label">Language:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="compiler-select"
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="c">C</option>
                </select>
              </div>

              {/* Run Button */}
              <button
                onClick={handleRun}
                disabled={loading || cooldown > 0}
                className="coding-btn coding-btn-primary compiler-run-btn"
              >
                <Play className="compiler-icon-play" />
                <span>{cooldown > 0 ? `Wait ${cooldown}s` : 'Run Code'}</span>
              </button>
            </div>
          </div>
          
          {/* Top Section: Custom Input (35%) */}
          <div className="compiler-input-section">
            <div className="compiler-panel-header">
              <div className="compiler-header-left">
                <Keyboard className="compiler-icon-keyboard" />
                <span className="compiler-panel-title">Custom Input</span>
              </div>
            </div>
            <div className="compiler-input-body">
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter input for your program here..."
                className="compiler-textarea"
              />
            </div>
          </div>

          {/* Bottom Section: Execution Console / Output */}
          <div className="compiler-output-section">
            <div className="compiler-panel-header">
              <div className="compiler-header-left">
                <Terminal className="compiler-icon-terminal" />
                <span className="compiler-panel-title">Console Output</span>
              </div>

              {/* Quick Status Info */}
              {runResult && !loading && (
                <div className="compiler-status-info">
                  <div className={`compiler-status-badge ${getStatusBadgeClass(runResult.status)}`}>
                    {runResult.status}
                  </div>
                  {runResult.time > 0 && (
                    <span className="compiler-time-info">
                      <Clock className="compiler-icon-clock" />
                      {runResult.time.toFixed(0)} ms
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="compiler-output-body">
              {loading ? (
                <div className="compiler-loading-msg">
                  <div className="coding-spinner compiler-icon-spinner"></div>
                  <span>Running code on secure runtime environment...</span>
                </div>
              ) : runResult ? (
                <div className="compiler-result-container">
                  {/* Compilation Output (if present) */}
                  {runResult.compileOutput && (
                    <div className="compiler-result-block">
                      <span className="compiler-result-label warning">
                        <AlertTriangle className="compiler-icon-alert" />
                        <span>Compilation Log</span>
                      </span>
                      <pre className="compiler-result-pre warning">
                        {runResult.compileOutput}
                      </pre>
                    </div>
                  )}

                  {/* Standard Error */}
                  {runResult.stderr && (
                    <div className="compiler-result-block">
                      <span className="compiler-result-label error">
                        <AlertCircle className="compiler-icon-alert" />
                        <span>Standard Error (stderr)</span>
                      </span>
                      <pre className="compiler-result-pre error">
                        {runResult.stderr}
                      </pre>
                    </div>
                  )}

                  {/* Standard Output */}
                  {(!runResult.compileOutput || runResult.status !== 'Compilation Error') && (
                    <div className="compiler-result-block">
                      <span className="compiler-result-label success">
                        <CheckCircle2 className="compiler-icon-check" />
                        <span>Standard Output (stdout)</span>
                      </span>
                      <pre className="compiler-result-pre success">
                        {runResult.stdout || '(Program completed successfully with no output)'}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="compiler-empty-msg">
                  No output. Click "Run Code" to compile and execute program.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {isDraggingWidth && (
        <div className="compiler-drag-overlay" />
      )}
    </div>
  );
};

export default Compiler;
