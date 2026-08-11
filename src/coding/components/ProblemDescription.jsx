import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import { Flag, Lightbulb, CheckCircle } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import './ProblemDescription.css';

const ProblemDescription = ({ onOpenIssue }) => {
  const { problemDetail: problem, userSubmissions } = useWorkspace();
  
  const isSolved = React.useMemo(() => {
    if (!problem || !userSubmissions) return false;
    return userSubmissions.some(sub => 
      sub.verdict === 'Accepted' && 
      (typeof sub.problemId === 'object' && sub.problemId != null ? sub.problemId._id === problem._id : sub.problemId === problem._id)
    );
  }, [problem, userSubmissions]);

  if (!problem) {
    return (
      <div className="problem-description-empty problem-desc-text-muted">
        Select a problem to start practicing.
      </div>
    );
  }

  return (
    <div className="coding-panel-content">
      <div className="problem-description-header">
        <div>
          <div className="problem-title-row">
            <h1 className="problem-title problem-desc-text-primary">
              {problem.problemNumber ? `${problem.problemNumber}. ` : ''}{problem.name}
            </h1>
            <span className={`coding-badge ${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
            <span className="coding-badge problem-category-badge">
              {problem.category || 'General'}
            </span>
            {isSolved && (
              <span className="coding-badge" style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: 'var(--coding-easy)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Solved
              </span>
            )}
          </div>
        </div>
        
        <button className="coding-btn coding-btn-outline problem-report-btn" onClick={onOpenIssue} title="Report an Issue/Bug">
          <Flag className="workspace-icon-sm" />
        </button>
      </div>

      <div className="coding-prose">
        <h3 className="problem-statement-title problem-desc-text-primary">Problem Statement</h3>
        <div className="problem-statement-content problem-desc-panel" dangerouslySetInnerHTML={{ __html: problem.statement }} />
      </div>

      {problem.constraints && (
        <div className="problem-section-mt">
          <h3 className="problem-constraints-title problem-desc-text-primary">Constraints:</h3>
          <ul className="problem-constraints-list problem-desc-text-muted">
            {problem.constraints.split('\n').map((constraint, index) => (
              <li key={index} className="problem-constraint-item">
                <code className="problem-constraint-code">{constraint}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {problem.examples && problem.examples.length > 0 && (
        <div className="problem-section-mt">
          <h3 className="problem-examples-title problem-desc-text-primary">Examples</h3>
          {problem.examples.map((example, index) => (
            <div key={index} className="problem-example-card">
              <h4 className="problem-example-heading problem-desc-text-primary">Example {index + 1}:</h4>
              <div className="problem-example-grid">
                <div className="problem-example-box">
                  <strong className="problem-example-label problem-desc-text-accent">Input:</strong>
                  <pre className="problem-example-pre">{example.input}</pre>
                </div>
                <div className="problem-example-box">
                  <strong className="problem-example-label problem-desc-text-success">Output:</strong>
                  <pre className="problem-example-pre">{example.output}</pre>
                </div>
              </div>
              {example.explanation && (
                <div className="problem-example-explanation problem-desc-text-muted">
                  <strong className="problem-desc-text-primary">Explanation: </strong>
                  {example.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {problem.hints && problem.hints.length > 0 && (
        <div className="problem-section-mt">
          <CollapsibleSection title="Hints">
            <div className="problem-hints-list">
              {problem.hints.map((hint, idx) => (
                <div key={idx} className="problem-hint-item problem-desc-panel-light">
                  <Lightbulb className="workspace-icon-md problem-desc-text-accent" />
                  <div>
                    <strong className="problem-desc-text-primary">Hint {idx + 1}:</strong> {hint}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}



    </div>
  );
};

export default ProblemDescription;
