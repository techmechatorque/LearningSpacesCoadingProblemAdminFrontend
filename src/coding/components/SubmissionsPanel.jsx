import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Calendar, Code } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

const SubmissionsPanel = () => {
  const { submissions, submissionsLoading, setViewingCode } = useWorkspace();

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="workspace-submissions-container">
      <h3 className="workspace-section-title">Submission History</h3>
      {submissionsLoading ? (
        <div className="workspace-loading-text">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="workspace-empty-state">No submissions recorded.</div>
      ) : (
        <table className="workspace-submissions-table">
          <thead>
            <tr className="workspace-submissions-tr">
              <th className="workspace-submissions-th">Status</th>
              <th className="workspace-submissions-th">Language</th>
              <th className="workspace-submissions-th">Runtime</th>
              <th className="workspace-submissions-th">Tests</th>
              <th className="workspace-submissions-th time-col">Time</th>
              <th className="workspace-submissions-th right-align">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => {
              const verdictClass = sub.verdict === 'Accepted' ? 'verdict-accepted' : sub.verdict === 'Wrong Answer' ? 'verdict-wrong' : 'verdict-other';
              return (
                <tr key={sub._id} className="workspace-submissions-tr row-data">
                  <td className={`workspace-submissions-td status-col ${verdictClass}`}>
                    {sub.verdict === 'Accepted' ? <CheckCircle className="workspace-icon-xs"/> : sub.verdict === 'Wrong Answer' ? <XCircle className="workspace-icon-xs"/> : <AlertTriangle className="workspace-icon-xs"/>} {sub.verdict}
                  </td>
                  <td className="workspace-submissions-td lang-col">{sub.language}</td>
                  <td className="workspace-submissions-td muted-td">{sub.runtime ? `${sub.runtime} ms` : '-'}</td>
                  <td className="workspace-submissions-td muted-td">{sub.passedTestCases} / {sub.totalTestCases}</td>
                  <td className="workspace-submissions-td time-col"><Calendar className="workspace-icon-xs"/> {formatDate(sub.createdAt)}</td>
                  <td className="workspace-submissions-td right-align">
                    <button className="workspace-view-code-btn" onClick={() => setViewingCode(sub.code)}>View Code</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SubmissionsPanel;
