import React from 'react';
import { HelpCircle, Code } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import './ProblemDescription.css'; // Inheriting styles

const SolutionsPanel = () => {
  const { problemDetail: problem } = useWorkspace();

  if (!problem || !problem.solution || (!problem.solution.explanation && !problem.solution.code)) {
    return (
      <div className="problem-description-empty problem-desc-text-muted">
        No official solution is available for this problem yet.
      </div>
    );
  }

  return (
    <div className="coding-panel-content">
      <div className="problem-solution-container" style={{ marginTop: 0 }}>
        {problem.solution.explanation && (
          <div>
            <h4 className="problem-solution-heading problem-desc-text-primary">
              <HelpCircle className="workspace-icon-sm problem-desc-text-accent" /> Explanation:
            </h4>
            <p className="problem-solution-text problem-desc-text-muted">
              {problem.solution.explanation}
            </p>
          </div>
        )}
        {problem.solution.code && (
          <div>
            <h4 className="problem-solution-heading problem-desc-text-primary">
              <Code className="workspace-icon-sm problem-desc-text-success" /> Reference Code:
            </h4>
            <pre className="problem-solution-code-pre problem-desc-panel-bordered problem-desc-text-success">
              <code>{problem.solution.code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolutionsPanel;
