import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/codingApi';
import { useAuth } from '../../context/AuthContext';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const { problemId: paramProblemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contestId = queryParams.get('contestId');
  const problemId = paramProblemId || queryParams.get('problemId');

  const { user } = useAuth();

  // Core Data State
  const [contestDetail, setContestDetail] = useState(null);
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [problemDetail, setProblemDetail] = useState(null);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [workspaceError, setWorkspaceError] = useState(null);

  // Loading States
  const [loading, setLoading] = useState(true); // Initial workspace load
  const [detailLoading, setDetailLoading] = useState(false); // Problem load
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);

  // Execution State (from CodeEditor)
  const [language, setLanguage] = useState('c');
  const [code, setCode] = useState('');
  const [customTestCases, setCustomTestCases] = useState([{ id: 1, input: '', name: 'Case 1' }]);
  const [executionLoading, setExecutionLoading] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  // UI Modal State
  const [viewingCode, setViewingCode] = useState(null);

  // Fetch initial problems data
  useEffect(() => {
    const fetchProblemsData = async () => {
      try {
        if (contestId) {
          const detail = await api.getContestById(contestId);
          setContestDetail(detail);
          setProblems(detail.problems || []);
          if (problemId) setSelectedProblemId(problemId);
          else if (detail.problems?.length > 0) setSelectedProblemId(detail.problems[0]._id);
          else setLoading(false);
        } else {
          const data = await api.getProblems();
          setProblems(data.problems || data);
          if (problemId) setSelectedProblemId(problemId);
          else if (data.length > 0) setSelectedProblemId(data[0]._id);
          else setLoading(false);
        }
      } catch (err) {
        setWorkspaceError("fetchProblemsData error: " + err.message);
        setLoading(false);
      }
    };
    fetchProblemsData();
    fetchUserSubmissions();
  }, [problemId, contestId]);

  const fetchUserSubmissions = async () => {
    try {
      const data = await api.getSubmissions();
      setUserSubmissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load specific problem detail when selected changes
  useEffect(() => {
    if (selectedProblemId) {
      const loadProblemDetail = async () => {
        setDetailLoading(true);
        // Reset execution state
        setRunResults(null);
        setSubmitResult(null);
        
        try {
          const detail = await api.getProblemById(selectedProblemId);
          setProblemDetail(detail);
          if (detail?.examples?.length > 0) {
            const initialCases = detail.examples.slice(0, 7).map((ex, idx) => ({
              id: Date.now() + idx,
              input: ex.input,
              name: `Case ${idx + 1}`
            }));
            setCustomTestCases(initialCases);
          } else {
            setCustomTestCases([{ id: Date.now(), input: '', name: 'Case 1' }]);
          }
        } catch (err) {
          console.error(err);
          setWorkspaceError("getProblemById error: " + err.message);
        } finally {
          setDetailLoading(false);
          setLoading(false);
        }
        
        setSubmissionsLoading(true);
        try {
          const subs = await api.getSubmissions(selectedProblemId);
          setSubmissions(contestId ? subs.filter(s => s.contestId === contestId) : subs);
        } catch(err) { console.error(err); }
        setSubmissionsLoading(false);

        if(!contestId || user?.role === 'admin') {
          setDiscussionsLoading(true);
          try {
            const discs = await api.getDiscussions(selectedProblemId);
            setDiscussions(discs);
          } catch(err) { console.error(err); }
          setDiscussionsLoading(false);
        } else {
          setDiscussions([]);
        }
      };
      loadProblemDetail();
    }
  }, [selectedProblemId, contestId, user]);

  // Handle URL change for problem selection
  const handleSelectProblem = (id) => {
    setSelectedProblemId(id);
    navigate(contestId ? `/workspace?problemId=${id}&contestId=${contestId}` : `/workspace?problemId=${id}`);
  };

  const handleSubmissionSuccess = async () => {
    fetchUserSubmissions();
    if (selectedProblemId) {
      try {
        const subs = await api.getSubmissions(selectedProblemId);
        setSubmissions(contestId ? subs.filter(s => s.contestId === contestId) : subs);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const executeCode = async (isSubmit) => {
    if (executionLoading || !problemDetail) return;
    setExecutionLoading(true);
    if (isSubmit) {
      setSubmitResult(null);
      setRunResults(null);
      try {
        let data = await api.submitCode(problemDetail._id, code, language, contestId);
        setSubmitResult(data);
        if (data.verdict === 'Pending') {
          const poll = async () => {
            try {
              const statusData = await api.getSubmissionStatus(data._id);
              setSubmitResult(statusData);
              if (statusData.verdict === 'Pending') setTimeout(poll, 1000);
              else {
                setExecutionLoading(false);
                handleSubmissionSuccess();
              }
            } catch (err) {
              setSubmitResult({ verdict: 'Runtime Error', passedTestCases: 0, totalTestCases: 0, failedDetails: { actualOutput: err.message } });
              setExecutionLoading(false);
            }
          };
          setTimeout(poll, 1000);
        } else {
          setExecutionLoading(false);
          handleSubmissionSuccess();
        }
      } catch (err) {
        setSubmitResult({ verdict: 'Runtime Error', passedTestCases: 0, totalTestCases: 0, failedDetails: { actualOutput: err.message } });
        setExecutionLoading(false);
      }
    } else {
      setRunResults(null);
      setSubmitResult(null);
      try {
        const casesToRun = customTestCases.slice(0, 7).map(tc => ({
          id: tc.id,
          name: tc.name,
          input: tc.input.trim() === '' ? (problemDetail?.examples?.[0]?.input || '') : tc.input
        }));
        const results = await api.runCode(problemDetail._id, code, language, casesToRun);
        setRunResults(results);
      } finally {
        setExecutionLoading(false);
      }
    }
  };

  const contextValue = {
    // Data
    user,
    contestDetail,
    contestId,
    problems,
    selectedProblemId,
    problemDetail,
    userSubmissions,
    submissions,
    discussions,
    
    // Actions
    setDiscussions,
    handleSelectProblem,
    setViewingCode,
    executeCode,
    
    // Code State
    language, setLanguage,
    code, setCode,
    customTestCases, setCustomTestCases,
    runResults, setRunResults,
    submitResult, setSubmitResult,
    
    // UI Loading / Modals
    loading,
    detailLoading,
    submissionsLoading,
    discussionsLoading,
    executionLoading,
    viewingCode,
    workspaceError
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
