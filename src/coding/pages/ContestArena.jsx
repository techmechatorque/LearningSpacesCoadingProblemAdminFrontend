import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../services/codingApi';
import ProblemDescription from '../components/ProblemDescription';
import CodeEditor from '../components/CodeEditor';
import '../styles/coding.css';
import './Workspace.css';
import './ContestHub.css';
import { Trophy, Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

const ContestArena = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { user } = useSelector(state => state.auth || { user: null });
  const currentUserId = user?._id || user?.id || '';

  const [contestDetail, setContestDetail] = useState(null);
  const initialQ = parseInt(searchParams.get('q'));
  const [activeProblemIndex, setActiveProblemIndex] = useState(!isNaN(initialQ) ? initialQ - 1 : 0);
  const [submissions, setSubmissions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const tabsRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Load contest details
  useEffect(() => {
    const fetchArenaData = async () => {
      if (!contestId) return;
      try {
        setLoading(true);
        const detail = await api.getContestById(contestId);
        setContestDetail(detail);
        
        // Fetch user submissions for this contest
        const subs = await api.getSubmissions(); 
        const mySubs = subs.filter(s => String(s.contestId) === String(contestId) && (String(s.userId) === String(currentUserId) || String(s.userId?._id) === String(currentUserId)));
        setSubmissions(mySubs);
        
      } catch (err) {
        setError(err.message || 'Failed to load contest arena');
      } finally {
        setLoading(false);
      }
    };
    fetchArenaData();
  }, [contestId, currentUserId]);

  // Timer logic
  useEffect(() => {
    if (!contestDetail) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(contestDetail.endTime);
      
      if (now >= end) {
        setTimeRemaining('00:00:00');
        setIsEnded(true);
        clearInterval(timerRef.current);
      } else {
        const ms = end - now;
        const totalSecs = Math.floor(ms / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        setTimeRemaining(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };
    
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => clearInterval(timerRef.current);
  }, [contestDetail]);

  const handleSubmissionSuccess = (submissionResult) => {
    setSubmissions([submissionResult, ...submissions]);
  };

  if (loading) {
    return (
      <div className="coding-app coding-loader-wrapper">
        <div className="coding-spinner"></div>
        <span>Initializing Arena...</span>
      </div>
    );
  }

  if (error || !contestDetail) {
    return (
      <div className="coding-workspace error-state">
        <div className="coding-alert-error">{error || 'Failed to load arena.'}</div>
        <button className="coding-btn coding-btn-primary" onClick={() => navigate('/coding/contests')}>Return to Hub</button>
      </div>
    );
  }

  const activeProblem = contestDetail.problems[activeProblemIndex];
  
  // Calculate score purely for display (rough estimate based on submissions)
  // Backend handles real leaderboard scoring
  const problemScores = {};
  submissions.forEach(sub => {
    if (!sub) return;
    const probId = sub.problemId?._id || sub.problemId;
    const score = (sub.passedTestCases || 0) * 10;
    if (score > (problemScores[probId] || 0)) {
      problemScores[probId] = score;
    }
  });
  
  const totalScore = Object.values(problemScores).reduce((a, b) => a + b, 0);
  const solvedCount = Object.keys(problemScores).filter(pid => problemScores[pid] > 0).length;

  return (
    <div className="coding-workspace arena-layout">
      {/* Top Navbar */}
      <div className="arena-navbar">
        <div className="arena-nav-left">
          <button className="coding-btn-link" onClick={() => navigate(`/coding/contests/${contestId}`)}>
            <ChevronLeft size={20} /> Exit Arena
          </button>
          <div className="arena-contest-title">
            <Trophy size={16} className="text-primary"/> 
            {contestDetail.name}
          </div>
        </div>
        
        <div className="arena-nav-center">
          <button className="arena-scroll-btn" onClick={() => scrollTabs('left')}>
            <ChevronLeft size={16} />
          </button>
          <div className="arena-problem-tabs-container" ref={tabsRef}>
            <div className="arena-problem-tabs">
              {contestDetail.problems.map((prob, idx) => {
                const isSolved = (problemScores[prob._id] || 0) > 0;
                return (
                  <button 
                    key={prob._id} 
                    className={`arena-prob-tab ${idx === activeProblemIndex ? 'active' : ''} ${isSolved ? 'solved' : ''}`}
                    onClick={() => {
                      setActiveProblemIndex(idx);
                      setSearchParams({ q: idx + 1 }, { replace: true });
                    }}
                  >
                    Q{idx + 1}
                    {isSolved && <CheckCircle size={14} style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }} />}
                  </button>
                );
              })}
            </div>
          </div>
          <button className="arena-scroll-btn" onClick={() => scrollTabs('right')}>
            <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="arena-nav-right">
          <div className={`arena-timer ${isEnded ? 'ended' : ''}`}>
            <Clock size={16} /> 
            {isEnded ? 'Contest Ended' : timeRemaining}
          </div>
          <div className="arena-score-display">
            Score: <strong>{totalScore}</strong>
          </div>
        </div>
      </div>

      {isEnded && (
        <div className="arena-ended-banner">
          <AlertTriangle size={18} />
          <span>The contest has ended. Submissions are no longer accepted.</span>
        </div>
      )}

      {/* Workspace Split Pane */}
      {activeProblem ? (
        <div className="workspace-split">
          <div className="workspace-pane workspace-left-pane">
            <div className="workspace-panel-content" style={{ flex: 1, overflowY: 'auto' }}>
              {/* ProblemDescription handles its own header and padding */}
              <ProblemDescription problem={activeProblem} isSolved={(problemScores[activeProblem._id] || 0) > 0} />
            </div>
          </div>
          
          <div className="workspace-pane workspace-right-pane">
            {/* Reuse CodeEditor but overlay a disabled state if contest ended */}
            {isEnded && <div className="arena-editor-disabled-overlay">Contest Ended</div>}
            
            <CodeEditor 
              problem={activeProblem} 
              onSubmitted={handleSubmissionSuccess} 
              contestId={contestId} 
            />
          </div>
        </div>
      ) : (
        <div className="coding-alert-error" style={{margin: '2rem'}}>
          No problems found in this contest.
        </div>
      )}
    </div>
  );
};

export default ContestArena;
