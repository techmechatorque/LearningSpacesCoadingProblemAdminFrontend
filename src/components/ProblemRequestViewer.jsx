import React, { useState } from 'react';
import { X, Check, XCircle, FileCode, Plus, Trash2 } from 'lucide-react';

const ProblemRequestViewer = ({ request, onClose, onAction }) => {
  const [activeTab, setActiveTab] = useState('general');

  // Payload structure follows the problem schema
  const { payload } = request;
  
  if (!payload) {
    return null;
  }

  const {
    name = '',
    difficulty = 'Easy',
    category = '',
    statement = '',
    constraints = '',
    examples = [],
    testCases = [],
    hints = [],
    solution = {},
    starterCode = {}
  } = payload;

  const handleApprove = () => {
    onAction(request._id, 'approve');
    onClose();
  };

  const handleReject = () => {
    onAction(request._id, 'reject');
    onClose();
  };

  return (
    <div className="h-full flex flex-col animate-fade-in min-w-0 bg-dark-bg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/60 p-5 bg-dark-bg/50">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white">Review Problem Request</h2>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                request.requestType === 'create_problem' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {request.requestType.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-dark-muted mt-1">Requested by: <span className="text-white font-medium">{request.requestedBy?.name || 'Unknown'}</span> ({request.requestedBy?.email})</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-hover text-dark-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-dark-border/80 px-6 pt-4 bg-dark-card space-x-6 shrink-0">
          {[
            { key: 'general', name: 'General & Content' },
            { key: 'testcases', name: 'Examples & Tests' },
            { key: 'solutions', name: 'Hints & Solution' },
            { key: 'startercode', name: 'Starter Codes' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`text-xs font-bold pb-3 border-b-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-dark-muted hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-dark-bg/20 space-y-6">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-dark-muted font-bold uppercase tracking-wider block">Question Name</label>
                  <input
                    type="text"
                    value={name}
                    readOnly
                    className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-sm text-dark-text opacity-90 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-dark-muted font-bold uppercase tracking-wider block">Category</label>
                  <input
                    type="text"
                    value={category}
                    readOnly
                    className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-sm text-dark-text opacity-90 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-dark-muted font-bold uppercase tracking-wider block">Difficulty</label>
                  <input
                    type="text"
                    value={difficulty}
                    readOnly
                    className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-sm text-dark-text opacity-90 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-dark-muted font-bold uppercase tracking-wider block">Problem Statement</label>
                <textarea
                  value={statement}
                  readOnly
                  rows={8}
                  className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-sm text-dark-text font-mono opacity-90 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-dark-muted font-bold uppercase tracking-wider block">Constraints</label>
                <textarea
                  value={constraints}
                  readOnly
                  rows={4}
                  className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-sm text-dark-text font-mono opacity-90 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Examples & Test Cases Tab */}
          {activeTab === 'testcases' && (
            <div className="space-y-6 animate-fade-in">
              {/* Examples */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-2">Examples</h3>
                {examples && examples.length > 0 ? (
                  <div className="space-y-4">
                    {examples.map((ex, idx) => (
                      <div key={idx} className="bg-dark-bg/50 border border-dark-border p-4 rounded-xl space-y-3">
                        <span className="text-[10px] font-bold text-dark-muted uppercase">Example {idx + 1}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-dark-muted font-bold uppercase">Input</label>
                            <textarea value={ex.input} readOnly rows={2} className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-xs font-mono text-dark-text opacity-90 cursor-not-allowed focus:outline-none"/>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-dark-muted font-bold uppercase">Output</label>
                            <textarea value={ex.output} readOnly rows={2} className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-xs font-mono text-dark-text opacity-90 cursor-not-allowed focus:outline-none"/>
                          </div>
                        </div>
                        {ex.explanation && (
                          <div className="space-y-1">
                            <label className="text-[10px] text-dark-muted font-bold uppercase">Explanation</label>
                            <input type="text" value={ex.explanation} readOnly className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-xs text-dark-text opacity-90 cursor-not-allowed focus:outline-none"/>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-muted">No examples provided.</p>
                )}
              </div>

              {/* Test Cases */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-2">Automated Grading Test Cases</h3>
                {testCases && testCases.length > 0 ? (
                  <div className="space-y-4">
                    {testCases.map((tc, idx) => (
                      <div key={idx} className="bg-dark-bg/50 border border-dark-border p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-dark-muted uppercase">Test Case {idx + 1}</span>
                          {tc.isHidden && (
                            <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Hidden</span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-dark-muted font-bold uppercase">Standard Stdin (Input)</label>
                            <textarea value={tc.input} readOnly rows={2} className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-xs font-mono text-dark-text opacity-90 cursor-not-allowed focus:outline-none"/>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-dark-muted font-bold uppercase">Expected Stdout (Output)</label>
                            <textarea value={tc.expectedOutput} readOnly rows={2} className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-xs font-mono text-dark-text opacity-90 cursor-not-allowed focus:outline-none"/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-muted">No test cases provided.</p>
                )}
              </div>
            </div>
          )}

          {/* Hints & Solutions Tab */}
          {activeTab === 'solutions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-2">Hints</h3>
                {hints && hints.length > 0 ? (
                  <div className="space-y-3">
                    {hints.map((hint, idx) => (
                      <div key={idx} className="flex items-center space-x-3 bg-dark-bg/50 p-3 border border-dark-border rounded-xl">
                        <span className="text-xs font-bold text-dark-muted shrink-0">Hint {idx + 1}:</span>
                        <input type="text" value={hint} readOnly className="flex-1 bg-transparent border-0 text-xs text-dark-text opacity-90 cursor-not-allowed focus:outline-none" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-muted">No hints provided.</p>
                )}
              </div>

              <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-2">Solution Profile</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-dark-muted font-bold uppercase tracking-wider block">Solution Explanation</label>
                  <textarea value={solution?.explanation || ''} readOnly rows={4} className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-sm text-dark-text opacity-90 cursor-not-allowed focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-dark-muted font-bold uppercase tracking-wider block">Reference Code</label>
                  <textarea value={solution?.code || ''} readOnly rows={6} className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-sm text-dark-text font-mono opacity-90 cursor-not-allowed focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Starter Code Tab */}
          {activeTab === 'startercode' && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4 animate-fade-in shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-2 flex items-center space-x-2">
                <FileCode className="h-4 w-4 text-brand-primary" />
                <span>Starter Templates</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-primary font-bold uppercase">C++ Template</label>
                  <textarea value={starterCode?.cpp || ''} readOnly rows={5} className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-xs text-dark-text font-mono opacity-90 cursor-not-allowed focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-secondary font-bold uppercase">Java Template</label>
                  <textarea value={starterCode?.java || ''} readOnly rows={5} className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-xs text-dark-text font-mono opacity-90 cursor-not-allowed focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-blue-400 font-bold uppercase">Python Template</label>
                  <textarea value={starterCode?.python || ''} readOnly rows={5} className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-xs text-dark-text font-mono opacity-90 cursor-not-allowed focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-amber-500 font-bold uppercase">C Template</label>
                  <textarea value={starterCode?.c || ''} readOnly rows={5} className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-3 text-xs text-dark-text font-mono opacity-90 cursor-not-allowed focus:outline-none" />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-dark-border/60 bg-dark-bg flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-dark-border text-sm font-semibold text-dark-muted hover:text-white hover:bg-dark-hover transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleReject}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <XCircle className="h-4 w-4" />
              <span>Reject Request</span>
            </button>
            <button
              onClick={handleApprove}
              className="flex items-center space-x-1.5 px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black rounded-xl text-sm font-bold shadow-lg shadow-green-500/10 transition-all cursor-pointer active:scale-95"
            >
              <Check className="h-4 w-4" />
              <span>Approve Request</span>
            </button>
          </div>
        </div>

    </div>
  );
};

export default ProblemRequestViewer;
