import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import './CodeEditor.css'; // Inheriting shared styles

const TestResultsPanel = () => {
  const {
    runResults, submitResult,
    executionLoading: loading,
    problemDetail: problem
  } = useWorkspace();

  const [selectedSubmitCaseIdx, setSelectedSubmitCaseIdx] = useState(0);
  const [selectedRunCaseIdx, setSelectedRunCaseIdx] = useState(0);

  useEffect(() => {
    if (submitResult) {
      if (submitResult.testCaseResults?.length > 0) {
        const firstFailedIdx = submitResult.testCaseResults.findIndex(r => r.verdict !== 'Accepted');
        setSelectedSubmitCaseIdx(firstFailedIdx >= 0 ? firstFailedIdx : 0);
      } else {
        setSelectedSubmitCaseIdx(submitResult.verdict === 'Accepted' ? 0 : submitResult.passedTestCases);
      }
    }
  }, [submitResult]);

  useEffect(() => {
    if (runResults && runResults.length > 0) {
      const firstFailedIdx = runResults.findIndex(r => r.status !== 'Accepted' && r.status !== 'Finished');
      setSelectedRunCaseIdx(firstFailedIdx >= 0 ? firstFailedIdx : 0);
    }
  }, [runResults]);

  const renderRunResultDetails = () => {
    if (!runResults || runResults.length === 0) return null;
    const runResult = runResults[selectedRunCaseIdx];
    if (!runResult) return null;

    return (
      <div className="code-editor-run-result">
        <div className="code-editor-run-header">
          <span className={`coding-badge ${(runResult.status==='Accepted' || runResult.status==='Finished')?'easy':'hard'}`}>{runResult.status}</span>
          {runResult.time > 0 && <span className="code-editor-time"><Clock className="workspace-icon-xs"/> {runResult.time.toFixed(0)} ms</span>}
        </div>
        {runResult.compileOutput && (
          <div className="code-editor-result-block"><strong className="code-editor-text-medium">Compiler Output:</strong><pre className="code-editor-pre code-editor-pre-medium">{runResult.compileOutput}</pre></div>
        )}
        {runResult.stderr && (
          <div className="code-editor-result-block"><strong className="code-editor-text-hard">Error:</strong><pre className="code-editor-pre code-editor-pre-hard">{runResult.stderr}</pre></div>
        )}
        {runResult.stdout !== undefined && (
          <div className="code-editor-result-block">
            <strong className={(runResult.status === 'Wrong Answer' || runResult.status === 'Error' || runResult.status === 'Runtime Error') ? 'code-editor-text-hard' : 'code-editor-text-easy'}>
              {runResult.expectedOutput !== undefined ? 'Actual Output:' : 'Output:'}
            </strong>
            <pre className="code-editor-pre">{runResult.stdout || '(No output)'}</pre>
          </div>
        )}
        {runResult.expectedOutput !== undefined && (
          <div className="code-editor-result-block">
            <strong className="code-editor-text-easy">Expected Output:</strong>
            <pre className="code-editor-pre">{runResult.expectedOutput || '(Empty)'}</pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="coding-panel-content" style={{ padding: '0.8rem', height: '100%', overflowY: 'auto' }}>
      <div className="code-editor-output-wrapper">
        {loading ? (
          <div className="code-editor-loading"><div className="coding-spinner spinner-small"></div> Running...</div>
        ) : runResults ? (
          <div className="code-editor-submit-result">
            {runResults.length > 0 && (
              <div className="code-editor-testcases-section">
                <div className="code-editor-testcases-grid" style={{ marginBottom: '12px' }}>
                  {runResults.map((res, idx) => {
                    let status = (res.status === 'Accepted' || res.status === 'Finished') ? 'passed' : 'failed';
                    return (
                      <button 
                        key={idx} 
                        onClick={() => setSelectedRunCaseIdx(idx)} 
                        className={`code-editor-tc-btn ${selectedRunCaseIdx === idx ? 'selected' : ''} tc-btn-${status}`}
                      >
                        {res.testCaseName || `Case ${idx + 1}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {renderRunResultDetails()}
          </div>
        ) : submitResult ? (
          <div className="code-editor-submit-result">
            <div className="code-editor-submit-header">
              {submitResult.verdict === 'Accepted' ? <CheckCircle className="workspace-icon-md workspace-icon-easy" /> : <XCircle className="workspace-icon-md workspace-icon-hard" />}
              <div>
                <span className={`coding-badge ${submitResult.verdict==='Accepted'?'easy':'hard'} code-editor-verdict-badge`}>{submitResult.verdict}</span>
                <div className="code-editor-passed-count">Passed: {submitResult.passedTestCases} / {submitResult.totalTestCases}</div>
              </div>
            </div>
            {submitResult.verdict === 'Compilation Error' && (
              <div className="code-editor-result-block"><strong className="code-editor-text-medium">Compiler Output:</strong><pre className="code-editor-pre code-editor-pre-medium">{submitResult.failedDetails?.actualOutput}</pre></div>
            )}
            {submitResult.totalTestCases > 0 && submitResult.verdict !== 'Compilation Error' && (
              <div className="code-editor-testcases-section">
                <span className="code-editor-testcases-label">Test Cases:</span>
                <div className="code-editor-testcases-grid">
                  {Array.from({ length: submitResult.totalTestCases }).map((_, idx) => {
                    let status = 'skipped';
                    if (submitResult.testCaseResults && submitResult.testCaseResults.length > idx) {
                      status = submitResult.testCaseResults[idx].verdict === 'Accepted' ? 'passed' : 'failed';
                    } else {
                      if (idx < submitResult.passedTestCases) status = 'passed';
                      else if (idx === submitResult.passedTestCases && submitResult.verdict !== 'Accepted') status = 'failed';
                    }
                    return (
                      <button key={idx} onClick={() => setSelectedSubmitCaseIdx(idx)} className={`code-editor-tc-btn ${selectedSubmitCaseIdx === idx ? 'selected' : ''} tc-btn-${status}`}>
                        Case {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {submitResult.verdict !== 'Compilation Error' && submitResult.totalTestCases > 0 && (
              <div className="code-editor-tc-details">
                {(() => {
                  const idx = selectedSubmitCaseIdx;
                  const tcResult = submitResult.testCaseResults?.[idx];
                  let status = 'skipped';
                  if (tcResult) {
                    status = tcResult.verdict === 'Accepted' ? 'passed' : 'failed';
                  } else {
                    if (idx < submitResult.passedTestCases) status = 'passed';
                    else if (idx === submitResult.passedTestCases && submitResult.verdict !== 'Accepted') status = 'failed';
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
                      if (tc && !tc.isHidden) { inputVal = tc.input; expectedVal = tc.expectedOutput; actualVal = tc.expectedOutput; }
                      else if (example) { inputVal = example.input; expectedVal = example.output; actualVal = example.output; }
                      else { inputVal = '[Hidden Test Case]'; expectedVal = '[Hidden Test Case]'; actualVal = '[Hidden Test Case]'; }
                    } else if (status === 'failed') {
                      inputVal = submitResult.failedDetails?.input || (tc && !tc.isHidden ? tc.input : (example ? example.input : '[Hidden Test Case]'));
                      expectedVal = submitResult.failedDetails?.expectedOutput || (tc && !tc.isHidden ? tc.expectedOutput : (example ? example.output : '[Hidden Test Case]'));
                      actualVal = submitResult.failedDetails?.actualOutput || '';
                    } else {
                      inputVal = (tc && !tc.isHidden) ? tc.input : (example ? example.input : '[Hidden Test Case]');
                      expectedVal = (tc && !tc.isHidden) ? tc.expectedOutput : (example ? example.output : '[Hidden Test Case]');
                      actualVal = '(Skipped)';
                    }
                  }
                  return (
                    <div className="code-editor-tc-content">
                      <div className="code-editor-tc-header">
                        <strong className={`code-editor-tc-title tc-title-${status}`}>Test Case {idx + 1} Details: {tcResult ? tcResult.verdict : status}</strong>
                        <span className="code-editor-tc-type">{isExample ? 'Example Case' : (tc && !tc.isHidden) ? 'Public Case' : 'Hidden Case'}</span>
                      </div>
                      <strong className="code-editor-text-muted">Input:</strong>
                      <pre className="code-editor-pre code-editor-pre-input">{inputVal}</pre>
                      <div className="code-editor-tc-grid">
                        <div className="code-editor-tc-col">
                          <strong className="code-editor-text-muted">Expected Output:</strong>
                          <pre className="code-editor-pre code-editor-pre-output code-editor-pre-easy">{expectedVal}</pre>
                        </div>
                        <div className="code-editor-tc-col">
                          <strong className="code-editor-text-muted">Actual Output:</strong>
                          <pre className={`code-editor-pre code-editor-pre-output ${status === 'passed' ? 'code-editor-pre-easy' : 'code-editor-pre-hard'}`}>{actualVal}</pre>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="code-editor-empty-state">No results. Click Run or Submit.</div>
        )}
      </div>
    </div>
  );
};

export default TestResultsPanel;
