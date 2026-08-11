import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import { Award, Code, HelpCircle, Lightbulb, CheckCircle, Send, Check } from 'lucide-react';

const ProblemDescription = ({ problem, user, onStatusUpdate }) => {
  if (!problem) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg text-dark-muted">
        Select a problem to start practicing.
      </div>
    );
  }

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'text-brand-secondary bg-brand-secondary/10 border-brand-secondary/20';
      case 'Medium':
        return 'text-brand-primary bg-brand-primary/10 border-brand-primary/20';
      case 'Hard':
        return 'text-brand-danger bg-brand-danger/10 border-brand-danger/20';
      default:
        return 'text-dark-muted bg-dark-hover border-dark-border';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-dark-bg space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <h1 className="text-2xl font-extrabold text-white">
              {problem.problemNumber ? `${problem.problemNumber}. ` : ''}{problem.name}
            </h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-dark-hover border border-dark-border text-dark-muted">
              {problem.category || 'General'}
            </span>
            
            {/* Status badge */}
            {problem.status === 'approved' ? (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold border text-brand-secondary bg-brand-secondary/10 border-brand-secondary/20 flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 shrink-0" />
                <span>Approved</span>
              </span>
            ) : problem.status === 'pending_approval' ? (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold border text-amber-500 bg-amber-500/10 border-amber-500/20 flex items-center space-x-1">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Pending Approval</span>
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold border text-dark-muted bg-dark-hover border-dark-border flex items-center space-x-1">
                <div className="h-1.5 w-1.5 rounded-full bg-dark-muted shrink-0" />
                <span>Draft</span>
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {problem.status === 'draft' && onStatusUpdate && (user?.role === 'admin' || !problem.createdBy || problem.createdBy === user?._id || problem.createdBy?._id === user?._id) && (
              <button
                onClick={() => onStatusUpdate('pending_approval')}
                className="bg-brand-primary text-black px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-brand-primary/95 transition-all shadow-md active:scale-95 hover:cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send to Admin</span>
              </button>
            )}
            {problem.status === 'pending_approval' && onStatusUpdate && user?.role === 'admin' && (
              <button
                onClick={() => onStatusUpdate('approved')}
                className="bg-brand-secondary text-black px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-brand-secondary/95 transition-all shadow-md active:scale-95 hover:cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Approve Problem</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="prose prose-invert max-w-none text-dark-text leading-relaxed">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>Problem Statement</span>
        </h3>
        {/* Render formatted description directly if it has HTML/rich text */}
        <div
          className="bg-dark-card/30 border border-dark-border/40 p-4 rounded-xl text-dark-text whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: problem.statement }}
        />
      </div>

      {/* Constraints */}
      {problem.constraints && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <span>Constraints:</span>
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-dark-muted">
            {problem.constraints.split('\n').map((constraint, index) => (
              <li key={index} className="leading-relaxed">
                <code>{constraint}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <span>Examples</span>
        </h3>
        {problem.examples && problem.examples.map((example, index) => (
          <div key={index} className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-semibold text-white">Example {index + 1}:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-dark-bg p-3 rounded-lg border border-dark-border/60">
                <span className="text-brand-primary block mb-1 font-bold">Input:</span>
                <pre className="whitespace-pre-wrap text-dark-text">{example.input}</pre>
              </div>
              <div className="bg-dark-bg p-3 rounded-lg border border-dark-border/60">
                <span className="text-brand-secondary block mb-1 font-bold">Output:</span>
                <pre className="whitespace-pre-wrap text-dark-text">{example.output}</pre>
              </div>
            </div>
            {example.explanation && (
              <div className="text-sm text-dark-muted pt-1">
                <strong className="text-dark-text">Explanation: </strong>
                {example.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hints (Collapsible) */}
      {problem.hints && problem.hints.length > 0 && (
        <CollapsibleSection title="Hints">
          <div className="space-y-3">
            {problem.hints.map((hint, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-dark-hover/35 border border-dark-border rounded-lg">
                <Lightbulb className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold text-white mr-1.5">Hint {idx + 1}:</span>
                  <span className="text-dark-text">{hint}</span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Solution (Collapsible) */}
      {problem.solution && (problem.solution.explanation || problem.solution.code) && (
        <CollapsibleSection title="Official Solution">
          <div className="space-y-4">
            {problem.solution.explanation && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <HelpCircle className="h-4 w-4 text-brand-primary" />
                  <span>Explanation:</span>
                </h4>
                <p className="text-sm text-dark-muted whitespace-pre-line leading-relaxed">
                  {problem.solution.explanation}
                </p>
              </div>
            )}

            {problem.solution.code && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <Code className="h-4 w-4 text-brand-secondary" />
                  <span>Reference Code:</span>
                </h4>
                <div className="relative">
                  <pre className="bg-dark-bg border border-dark-border rounded-lg p-4 text-xs font-mono overflow-x-auto text-brand-secondary leading-relaxed">
                    <code>{problem.solution.code}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default ProblemDescription;
