import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, ChevronUp, ChevronDown, Terminal, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import * as api from '../services/api';

const CodeEditor = ({ problem, onSubmitted }) => {
  const [language, setLanguage] = useState('c');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showConsole, setShowConsole] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState('input'); // 'input' or 'output'
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [selectedSubmitCaseIdx, setSelectedSubmitCaseIdx] = useState(0);
  
  // Vertical resizer state & handlers for console
  const [consoleHeight, setConsoleHeight] = useState(256); // pixels
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);

  const startVerticalResize = useCallback((e) => {
    setIsDraggingHeight(true);
    e.target.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isDraggingHeight) return;

    const handlePointerMove = (e) => {
      const container = document.getElementById('editor-container');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      
      // Calculate height from container bottom
      let newHeight = containerRect.bottom - e.clientY;
      
      // Enforce boundaries (min 100px, max of container height minus 100px)
      const minHeight = 100;
      const maxHeight = containerRect.height - 100;
      if (newHeight < minHeight) newHeight = minHeight;
      if (newHeight > maxHeight) newHeight = maxHeight;
      
      setConsoleHeight(newHeight);
    };

    const handlePointerUp = (e) => {
      setIsDraggingHeight(false);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingHeight]);

  // Pre-populate custom input with the first example's input when problem changes
  useEffect(() => {
    if (problem && problem.examples && problem.examples.length > 0) {
      setCustomInput(problem.examples[0].input);
    } else {
      setCustomInput('');
    }
  }, [problem]);

  // Default selected test case when submitResult changes
  useEffect(() => {
    if (submitResult) {
      if (submitResult.testCaseResults && submitResult.testCaseResults.length > 0) {
        const firstFailedIdx = submitResult.testCaseResults.findIndex(r => r.verdict !== 'Accepted');
        setSelectedSubmitCaseIdx(firstFailedIdx >= 0 ? firstFailedIdx : 0);
      } else {
        if (submitResult.verdict === 'Accepted') {
          setSelectedSubmitCaseIdx(0);
        } else {
          setSelectedSubmitCaseIdx(submitResult.passedTestCases);
        }
      }
    }
  }, [submitResult]);

  // Set default starter code when problem or language changes
  useEffect(() => {
    if (problem) {
      const starter = problem.starterCode?.[language];
      if (starter) {
        setCode(starter);
      } else {
        // Fallbacks
        switch (language) {
          case 'cpp':
            setCode('#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}');
            break;
          case 'java':
            setCode('public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}');
            break;
          case 'python':
            setCode('# Write your code here\n');
            break;
          case 'c':
          default:
            setCode('// Write your code here\n');
            break;
        }
      }
    }
  }, [problem, language]);

  const handleRun = async () => {
    setLoading(true);
    setSubmitResult(null);
    setRunResult(null);
    setActiveConsoleTab('output');
    setShowConsole(true);

    // Fallback to the first example test case input if custom input is empty
    const inputToUse = customInput.trim() === '' ? (problem?.examples?.[0]?.input || '') : customInput;

    try {
      const data = await api.runCode(problem?._id, code, language, inputToUse);
      setRunResult({ ...data, input: inputToUse });
    } catch (err) {
      setRunResult({
        status: 'Error',
        stderr: err.message || 'Execution failed',
        input: inputToUse
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setLoading(true);
    setRunResult(null);
    setSubmitResult(null);
    setActiveConsoleTab('output');
    setShowConsole(true);

    try {
      let data = await api.submitCode(problem._id, code, language);
      setSubmitResult(data);

      if (data.verdict === 'Pending') {
        const submissionId = data._id;

        const poll = async () => {
          try {
            const statusData = await api.getSubmissionStatus(submissionId);
            setSubmitResult(statusData);

            if (statusData.verdict === 'Pending') {
              setTimeout(poll, 1000);
            } else {
              setLoading(false);
              if (onSubmitted) {
                onSubmitted(); // Notify parent to refresh submission history
              }
            }
          } catch (err) {
            setSubmitResult({
              verdict: 'Runtime Error',
              passedTestCases: 0,
              totalTestCases: 0,
              failedDetails: { actualOutput: err.message || 'Error checking submission status' }
            });
            setLoading(false);
          }
        };

        // Start polling after 1s
        setTimeout(poll, 1000);
      } else {
        setLoading(false);
        if (onSubmitted) {
          onSubmitted();
        }
      }
    } catch (err) {
      setSubmitResult({
        verdict: 'Runtime Error',
        passedTestCases: 0,
        totalTestCases: 0,
        failedDetails: { actualOutput: err.message || 'Submission failed' }
      });
      setLoading(false);
    }
  };

  const getVerdictBadgeClass = (verdict) => {
    switch (verdict) {
      case 'Accepted':
        return 'text-brand-secondary bg-brand-secondary/15 border-brand-secondary/30';
      case 'Wrong Answer':
        return 'text-brand-danger bg-brand-danger/15 border-brand-danger/30';
      case 'Compilation Error':
        return 'text-amber-500 bg-amber-500/15 border-amber-500/30';
      case 'Pending':
        return 'text-blue-400 bg-blue-400/15 border-blue-400/30 animate-pulse';
      case 'Memory Limit Exceeded':
        return 'text-purple-400 bg-purple-400/15 border-purple-400/30';
      case 'Runtime Error':
      case 'Time Limit Exceeded':
      default:
        return 'text-red-400 bg-red-400/15 border-red-400/30';
    }
  };

  return (
    <div id="editor-container" className="flex-1 flex flex-col bg-dark-panel h-full relative overflow-hidden">
      {/* Editor Control Panel */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border bg-dark-card shrink-0">
        <div className="flex items-center space-x-2">
          <label className="text-xs text-dark-muted font-bold uppercase tracking-wider">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-dark-bg border border-dark-border text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-primary"
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="c">C</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRun}
            disabled={loading}
            className="flex items-center space-x-1.5 bg-dark-bg hover:bg-dark-hover border border-dark-border text-dark-text px-3 py-1.5 rounded-lg text-xs font-semibold hover:text-white transition-all disabled:opacity-50 hover:cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Run Code</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-1.5 bg-brand-secondary hover:bg-brand-secondary/95 text-black px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 hover:cursor-pointer shadow-md"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 min-h-0 bg-dark-panel">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'python' ? 'python' : 'c'}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
          }}
        />
      </div>

      {/* Expandable Console Section */}
      <div 
        style={{ height: showConsole ? `${consoleHeight}px` : '40px' }}
        className="border-t border-dark-border bg-dark-card flex flex-col shrink-0 relative transition-[border,background-color] duration-200"
      >
        {/* Vertical Resizer Handle */}
        {showConsole && (
          <div
            onPointerDown={startVerticalResize}
            className={`absolute top-0 left-0 right-0 h-1 cursor-row-resize z-30 transition-colors duration-150 ${
              isDraggingHeight ? 'bg-brand-primary' : 'bg-transparent hover:bg-brand-primary/50'
            }`}
            style={{ marginTop: '-2.25px' }}
          />
        )}
        {/* Console Header / Toggle */}
        <div className="flex items-center justify-between px-4 h-10 border-b border-dark-border/40 select-none bg-dark-hover/40">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="flex items-center space-x-1.5 text-xs font-bold text-dark-text hover:text-white transition-colors bg-transparent border-0 hover:cursor-pointer"
          >
            <Terminal className="h-4 w-4 text-brand-primary" />
            <span>Console</span>
            {showConsole ? <ChevronDown className="h-3.5 w-3.5 ml-1" /> : <ChevronUp className="h-3.5 w-3.5 ml-1" />}
          </button>

          {showConsole && (
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveConsoleTab('input')}
                className={`px-3 py-1 rounded text-xs font-semibold border-0 hover:cursor-pointer ${activeConsoleTab === 'input' ? 'bg-dark-bg text-brand-primary font-bold' : 'text-dark-muted hover:text-white'
                  }`}
              >
                Custom Input
              </button>
              <button
                onClick={() => setActiveConsoleTab('output')}
                className={`px-3 py-1 rounded text-xs font-semibold border-0 hover:cursor-pointer ${activeConsoleTab === 'output' ? 'bg-dark-bg text-brand-primary font-bold' : 'text-dark-muted hover:text-white'
                  }`}
              >
                Output
              </button>
            </div>
          )}
        </div>

        {/* Console Body */}
        {showConsole && (
          <div className="flex-1 p-4 overflow-y-auto bg-dark-bg/95 font-mono text-sm min-h-0 text-dark-text">
            {activeConsoleTab === 'input' ? (
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom program input here..."
                className="w-full h-full bg-dark-card/50 border border-dark-border rounded-lg p-3 text-xs font-mono text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none"
              />
            ) : (
              <div className="space-y-3 h-full">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-dark-muted space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent"></div>
                    <span className="text-xs">Running/Compiling code...</span>
                  </div>
                ) : (
                  <>
                    {/* Run Results */}
                    {runResult && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-dark-muted uppercase font-bold">Status:</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase ${runResult.status === 'Accepted' ? 'text-brand-secondary bg-brand-secondary/10' : 'text-amber-500 bg-amber-500/10'
                            }`}>
                            {runResult.status}
                          </span>
                          {runResult.time > 0 && (
                            <span className="text-dark-muted flex items-center ml-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {runResult.time.toFixed(0)} ms
                            </span>
                          )}
                        </div>

                        {runResult.compileOutput && (
                          <div className="space-y-1">
                            <span className="text-xs text-amber-500 font-bold block">Compiler Output:</span>
                            <pre className="bg-dark-card p-3 rounded-lg border border-dark-border text-xs text-amber-300 overflow-x-auto whitespace-pre-wrap">{runResult.compileOutput}</pre>
                          </div>
                        )}

                        {runResult.stderr && (
                          <div className="space-y-1">
                            <span className="text-xs text-brand-danger font-bold block">Standard Error:</span>
                            <pre className="bg-dark-card p-3 rounded-lg border border-dark-border text-xs text-brand-danger overflow-x-auto whitespace-pre-wrap">{runResult.stderr}</pre>
                          </div>
                        )}

                        {runResult.input !== undefined && (
                          <div className="space-y-1">
                            <span className="text-xs text-dark-muted font-bold block">Input:</span>
                            <pre className="bg-dark-card p-3 rounded-lg border border-dark-border text-xs text-dark-text overflow-x-auto whitespace-pre-wrap">{runResult.input || '(No input)'}</pre>
                          </div>
                        )}

                        {/* If matched with an example, show expected output alongside actual output */}
                        {(() => {
                          const normalizeString = (str) => {
                            if (!str) return '';
                            return str.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '').join('\n');
                          };
                          const matchedExample = problem?.examples?.find(
                            ex => normalizeString(ex.input) === normalizeString(runResult.input)
                          );

                          if (matchedExample) {
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <span className="text-xs text-brand-secondary font-bold block">Expected Output:</span>
                                  <pre className="bg-dark-card p-3 rounded-lg border border-dark-border text-xs text-brand-secondary overflow-x-auto whitespace-pre-wrap">{matchedExample.output}</pre>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-xs text-brand-primary font-bold block">Your Output:</span>
                                  <pre className="bg-dark-card p-3 rounded-lg border border-dark-border text-xs text-dark-text overflow-x-auto whitespace-pre-wrap">{runResult.stdout || '(No stdout)'}</pre>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              runResult.stdout !== undefined && (
                                <div className="space-y-1">
                                  <span className="text-xs text-brand-secondary font-bold block">Standard Output:</span>
                                  <pre className="bg-dark-card p-3 rounded-lg border border-dark-border text-xs text-dark-text overflow-x-auto whitespace-pre-wrap">{runResult.stdout || '(No stdout)'}</pre>
                                </div>
                              )
                            );
                          }
                        })()}
                      </div>
                    )}

                    {/* Submit Results */}
                    {submitResult && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2.5 border border-dark-border rounded-xl p-3 bg-dark-card/30">
                          {submitResult.verdict === 'Accepted' ? (
                            <CheckCircle2 className="h-7 w-7 text-brand-secondary shrink-0" />
                          ) : submitResult.verdict === 'Wrong Answer' ? (
                            <XCircle className="h-7 w-7 text-brand-danger shrink-0" />
                          ) : submitResult.verdict === 'Pending' ? (
                            <div className="h-7 w-7 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0"></div>
                          ) : (
                            <AlertCircle className="h-7 w-7 text-amber-500 shrink-0" />
                          )}
                          <div>
                            <div className={`text-base font-extrabold px-2 py-0.5 rounded border ${getVerdictBadgeClass(submitResult.verdict)} inline-block`}>
                              {submitResult.verdict}
                            </div>
                            <div className="text-xs text-dark-muted mt-1 font-medium">
                              Passed Test Cases: <strong className="text-white">{submitResult.passedTestCases}</strong> / {submitResult.totalTestCases}
                              {submitResult.runtime > 0 && (
                                <span className="inline-flex items-center ml-3">
                                  <Clock className="h-3.5 w-3.5 mr-0.5" />
                                  Runtime: <strong className="text-white ml-0.5">{submitResult.runtime} ms</strong>
                                </span>
                              )}
                              {submitResult.memory > 0 && (
                                <span className="inline-flex items-center ml-3">
                                  Memory: <strong className="text-white ml-0.5">{(submitResult.memory / 1024).toFixed(1)} MB</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Test Case Selection Tabs */}
                        {submitResult.totalTestCases > 0 && submitResult.verdict !== 'Compilation Error' && (
                          <div className="space-y-2 mt-3 border-t border-dark-border/40 pt-3">
                            <span className="text-xs text-dark-muted font-bold block uppercase tracking-wider">Test Cases:</span>
                            <div className="flex flex-wrap gap-2">
                              {Array.from({ length: submitResult.totalTestCases }).map((_, idx) => {
                                const caseNum = idx + 1;
                                let status = 'skipped'; // 'passed', 'failed', 'skipped'

                                if (submitResult.testCaseResults && submitResult.testCaseResults.length > idx) {
                                  const tcRes = submitResult.testCaseResults[idx];
                                  status = tcRes.verdict === 'Accepted' ? 'passed' : 'failed';
                                } else {
                                  if (idx < submitResult.passedTestCases) {
                                    status = 'passed';
                                  } else if (idx === submitResult.passedTestCases && submitResult.verdict !== 'Accepted') {
                                    status = 'failed';
                                  }
                                }

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedSubmitCaseIdx(idx)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border hover:cursor-pointer transition-all ${selectedSubmitCaseIdx === idx
                                        ? 'ring-2 ring-brand-primary border-brand-primary'
                                        : ''
                                      } ${status === 'passed'
                                        ? 'bg-brand-secondary/15 border-brand-secondary/30 text-brand-secondary'
                                        : status === 'failed'
                                          ? 'bg-brand-danger/15 border-brand-danger/30 text-brand-danger'
                                          : 'bg-dark-hover/40 border-dark-border/60 text-dark-muted'
                                      }`}
                                  >
                                    <span>Case {caseNum}</span>
                                    {status === 'passed' && <CheckCircle2 className="h-3 w-3" />}
                                    {status === 'failed' && <XCircle className="h-3 w-3" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Selected Test Case Details */}
                        {(() => {
                          if (submitResult.verdict === 'Compilation Error') {
                            return (
                              <div className="space-y-1.5 bg-dark-card/25 p-3 rounded-lg border border-dark-border/40 text-xs mt-3">
                                <h4 className="text-amber-500 font-bold text-xs uppercase tracking-wide">Compiler Output:</h4>
                                <pre className="bg-dark-bg p-3 rounded text-amber-300 font-mono border border-dark-border mt-1 overflow-x-auto whitespace-pre-wrap">
                                  {submitResult.failedDetails?.actualOutput || 'Compilation failed'}
                                </pre>
                              </div>
                            );
                          }

                          const idx = selectedSubmitCaseIdx;
                          const tcResult = submitResult.testCaseResults?.[idx];
                          let status = 'skipped';

                          if (tcResult) {
                            status = tcResult.verdict === 'Accepted' ? 'passed' : 'failed';
                          } else {
                            if (idx < submitResult.passedTestCases) {
                              status = 'passed';
                            } else if (idx === submitResult.passedTestCases && submitResult.verdict !== 'Accepted') {
                              status = 'failed';
                            }
                          }

                          const tc = problem?.testCases?.[idx];
                          const isExample = idx < (problem?.examples?.length || 0);
                          const example = isExample ? problem.examples[idx] : null;

                          let inputVal = '';
                          let expectedVal = '';
                          let actualVal = '';

                          if (tcResult) {
                            inputVal = tcResult.input;
                            expectedVal = tcResult.expectedOutput;
                            actualVal = tcResult.actualOutput;
                          } else {
                            if (status === 'passed') {
                              if (tc && !tc.isHidden) {
                                inputVal = tc.input;
                                expectedVal = tc.expectedOutput;
                                actualVal = tc.expectedOutput;
                              } else if (example) {
                                inputVal = example.input;
                                expectedVal = example.output;
                                actualVal = example.output;
                              } else {
                                inputVal = '[Hidden Test Case]';
                                expectedVal = '[Hidden Test Case]';
                                actualVal = '[Hidden Test Case]';
                              }
                            } else if (status === 'failed') {
                              inputVal = submitResult.failedDetails?.input || (tc && !tc.isHidden ? tc.input : (example ? example.input : '[Hidden Test Case]'));
                              expectedVal = submitResult.failedDetails?.expectedOutput || (tc && !tc.isHidden ? tc.expectedOutput : (example ? example.output : '[Hidden Test Case]'));
                              actualVal = submitResult.failedDetails?.actualOutput || '';
                            } else {
                              if (tc && !tc.isHidden) {
                                inputVal = tc.input;
                                expectedVal = tc.expectedOutput;
                              } else if (example) {
                                inputVal = example.input;
                                expectedVal = example.output;
                              } else {
                                inputVal = '[Hidden Test Case]';
                                expectedVal = '[Hidden Test Case]';
                              }
                              actualVal = '(Skipped)';
                            }
                          }

                          return (
                            <div className="space-y-3 bg-dark-card/25 p-4 rounded-xl border border-dark-border/40 text-xs mt-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-xs uppercase tracking-wide flex items-center space-x-1.5">
                                  <span>Test Case {idx + 1} Details:</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${status === 'passed'
                                      ? 'text-brand-secondary bg-brand-secondary/15'
                                      : status === 'failed'
                                        ? 'text-brand-danger bg-brand-danger/15'
                                        : 'text-dark-muted bg-dark-hover'
                                    }`}>
                                    {tcResult ? tcResult.verdict : status}
                                  </span>
                                </h4>
                                {isExample ? (
                                  <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wider bg-brand-primary/10 px-2 py-0.5 rounded">
                                    Example Case
                                  </span>
                                ) : tc && !tc.isHidden ? (
                                  <span className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider bg-brand-secondary/10 px-2 py-0.5 rounded">
                                    Public Case
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-dark-muted font-bold uppercase tracking-wider bg-dark-hover px-2 py-0.5 rounded">
                                    Hidden Case
                                  </span>
                                )}
                              </div>

                              <div>
                                <span className="text-dark-muted block">Input:</span>
                                <pre className="bg-dark-bg p-2.5 rounded text-dark-text font-mono border border-dark-border mt-0.5 overflow-x-auto whitespace-pre-wrap">{inputVal}</pre>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="text-dark-muted block">Expected Output:</span>
                                  <pre className="bg-dark-bg p-2.5 rounded text-brand-secondary font-mono border border-dark-border mt-0.5 overflow-x-auto whitespace-pre-wrap">{expectedVal}</pre>
                                </div>
                                <div>
                                  <span className="text-dark-muted block">Your Output:</span>
                                  <pre className={`bg-dark-bg p-2.5 rounded font-mono border border-dark-border mt-0.5 overflow-x-auto whitespace-pre-wrap ${status === 'passed'
                                      ? 'text-brand-secondary'
                                      : status === 'failed'
                                        ? 'text-brand-danger'
                                        : 'text-dark-muted'
                                    }`}>{actualVal || '(Empty)'}</pre>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {!runResult && !submitResult && (
                      <div className="text-center text-xs text-dark-muted py-6">
                        No execution results yet. Click "Run Code" or "Submit".
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {isDraggingHeight && (
        <div className="fixed inset-0 z-50 cursor-row-resize bg-transparent" />
      )}
    </div>
  );
};

export default CodeEditor;
