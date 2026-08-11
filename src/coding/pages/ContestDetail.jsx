import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/codingApi';
import '../styles/coding.css';
import './ContestHub.css';
import { Trophy, Clock, Calendar, CheckCircle, Award, Users, ChevronRight, Lock, ExternalLink } from 'lucide-react';
import { useSelector } from 'react-redux';

const ContestDetail = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contestDetail, setContestDetail] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  
  const [timeRemaining, setTimeRemaining] = useState('');
  const timerRef = useRef(null);

  const { user } = useSelector(state => state.auth || { user: null });
  const currentUserId = user?._id || user?.id || '';

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const detail = await api.getContestById(contestId);
        setContestDetail(detail);
        const lb = await api.getContestLeaderboard(contestId);
        setLeaderboard(lb);
      } catch (err) {
        setError(err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    if (contestId) fetchDetail();
  }, [contestId]);

  useEffect(() => {
    if (!contestDetail) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    const updateTimer = () => {
      const now = new Date();
      const start = new Date(contestDetail.startTime);
      const end = new Date(contestDetail.endTime);
      
      if (now < start) {
        setTimeRemaining(formatCountdown(start - now));
      } else if (now >= start && now <= end) {
        setTimeRemaining(formatCountdown(end - now));
      } else {
        setTimeRemaining('Contest Ended');
      }
    };
    
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => clearInterval(timerRef.current);
  }, [contestDetail]);

  const formatCountdown = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hrs = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    if (days > 0) return `${days}d ${hrs}h ${mins}m ${secs}s`;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRegister = async () => {
    if (!contestDetail) return;
    setRegistering(true);
    setError('');
    try {
      await api.registerContest(contestDetail._id);
      setContestDetail({ ...contestDetail, isRegistered: true });
      const lb = await api.getContestLeaderboard(contestDetail._id);
      setLeaderboard(lb);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="coding-app coding-loader-wrapper">
        <div className="coding-spinner"></div>
        <span>Loading Contest Details...</span>
      </div>
    );
  }

  if (error || !contestDetail) {
    return (
      <div className="contest-detail-container">
        <div className="coding-alert-error">{error || 'Contest not found'}</div>
        <button className="coding-btn coding-btn-outline" onClick={() => navigate('/coding/contests')} style={{marginTop: '1rem'}}>
          Back to Hub
        </button>
      </div>
    );
  }

  const userRankStats = leaderboard.find(row => row.userId === currentUserId);
  const isOngoing = contestDetail.status === 'Ongoing';
  const isUpcoming = contestDetail.status === 'Upcoming';
  const isPast = contestDetail.status === 'Past';

  return (
    <div className="contest-detail-page">
      {/* Back button */}
      <div className="contest-detail-back">
        <button className="coding-btn-link" onClick={() => navigate('/coding/contests')}>
          &larr; Back to Contests
        </button>
      </div>

      {/* Main Container */}
      <div className="contest-detail-container">
        {/* Header Section */}
        <div className={`contest-detail-header status-${contestDetail.status.toLowerCase()}`}>
          <div className="cd-header-content">
            <span className={`coding-badge ${isOngoing ? 'medium' : isUpcoming ? 'easy' : 'unsolved'}`}>
              {contestDetail.status}
            </span>
            <h1 className="cd-title">{contestDetail.name}</h1>
            <p className="cd-desc">{contestDetail.description || 'A competitive programming contest to challenge your coding skills.'}</p>
            
            <div className="cd-meta-row">
              <div className="cd-meta-item">
                <Calendar size={18} />
                <div>
                  <strong>Start Time</strong>
                  <span>{formatDate(contestDetail.startTime)}</span>
                </div>
              </div>
              <div className="cd-meta-item">
                <Clock size={18} />
                <div>
                  <strong>End Time</strong>
                  <span>{formatDate(contestDetail.endTime)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="cd-timer-box">
            {isUpcoming && <div className="cd-timer-label">Starts In</div>}
            {isOngoing && <div className="cd-timer-label live">Live Now - Ends In</div>}
            {isPast && <div className="cd-timer-label ended">Contest Ended</div>}
            
            <div className={`cd-timer-value ${isOngoing ? 'live' : ''}`}>
              {timeRemaining}
            </div>

            <div className="cd-unique-action-container">
              {!contestDetail.isRegistered && !isPast ? (
                <button 
                  className="coding-btn coding-btn-primary cd-unique-btn-block" 
                  onClick={handleRegister} 
                  disabled={registering}
                >
                  {registering ? 'Registering...' : <><Award size={18} style={{marginRight: '8px'}}/> Register Now</>}
                </button>
              ) : isOngoing && contestDetail.isRegistered ? (
                <button 
                  className="coding-btn coding-btn-primary cd-unique-btn-block cd-unique-enter-btn"
                  onClick={() => navigate(`/coding/contests/${contestId}/arena`)}
                >
                  Enter Contest <ChevronRight size={18} style={{marginLeft: '8px'}}/>
                </button>
              ) : isUpcoming && contestDetail.isRegistered ? (
                <div className="cd-registered-msg">
                  <CheckCircle size={18} /> You are registered
                </div>
              ) : isPast ? (
                <button 
                  className="coding-btn coding-btn-outline cd-unique-btn-block"
                  onClick={() => navigate(`/coding/contests/${contestId}/arena`)}
                >
                  View Problems <ExternalLink size={16} style={{marginLeft: '8px'}}/>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="cd-content-grid">
          {/* Left Column */}
          <div className="cd-left-column">
            
            {/* User Stats (If registered and not upcoming) */}
            {contestDetail.isRegistered && !isUpcoming && userRankStats && (
              <div className="cd-panel">
                <h3 className="cd-panel-title">Your Performance</h3>
                <div className="cd-stats-grid">
                  <div className="cd-stat-box">
                    <span className="cd-stat-label">Rank</span>
                    <span className="cd-stat-value text-primary">#{userRankStats.rank}</span>
                  </div>
                  <div className="cd-stat-box">
                    <span className="cd-stat-label">Score</span>
                    <span className="cd-stat-value text-easy">{userRankStats.score} pts</span>
                  </div>
                  <div className="cd-stat-box">
                    <span className="cd-stat-label">Solved</span>
                    <span className="cd-stat-value">{userRankStats.solvedCount} / {contestDetail.problems?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rules */}
            <div className="cd-panel">
              <h3 className="cd-panel-title">Contest Rules</h3>
              <ul className="cd-rules-list">
                <li>Ranking is based on the highest score. If scores are tied, the user who reached the score earliest is ranked higher.</li>
                <li>Each passed testcase typically awards points (e.g., 10 pts per testcase).</li>
                <li>Discussions are disabled during the contest to prevent cheating.</li>
                <li>You may submit as many times as you like. Only your best score per problem is counted.</li>
              </ul>
            </div>

            {/* Problems List (If available) */}
            <div className="cd-panel">
              <h3 className="cd-panel-title">Problems</h3>
              {isUpcoming ? (
                <div className="cd-locked-msg">
                  <Lock size={24} />
                  <p>Problems will be visible once the contest starts.</p>
                </div>
              ) : (!contestDetail.isRegistered && isOngoing) ? (
                <div className="cd-locked-msg">
                  <Lock size={24} />
                  <p>Register for the contest to view problems.</p>
                </div>
              ) : (
                <div className="cd-problem-list">
                  {contestDetail.problems?.map((prob, index) => (
                    <div key={prob._id} className="cd-problem-item">
                      <div className="cd-problem-info">
                        <span className="cd-problem-num">Q{index + 1}</span>
                        <div>
                          <strong>{prob.name}</strong>
                          <div className="cd-problem-meta">
                            <span className={`difficulty-${prob.difficulty.toLowerCase()}`}>{prob.difficulty}</span>
                            <span> • {prob.category}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        className="coding-btn coding-btn-outline"
                        onClick={() => navigate(`/coding/contests/${contestId}/arena`)}
                      >
                        Solve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Leaderboard */}
          <div className="cd-right-column">
            <div className="cd-panel cd-leaderboard-panel">
              <h3 className="cd-panel-title">
                <Trophy size={18} style={{marginRight: '8px', color: 'var(--coding-primary)'}}/> 
                Top Ranked
              </h3>
              
              {leaderboard.length === 0 ? (
                <div className="cd-empty-leaderboard">
                  No participants yet.
                </div>
              ) : (
                <div className="cd-leaderboard-list">
                  {leaderboard.slice(0, 10).map((row) => (
                    <div key={row.userId} className={`cd-lb-row ${row.userId === currentUserId ? 'is-me' : ''}`}>
                      <div className="cd-lb-user">
                        <span className={`cd-lb-rank ${row.rank <= 3 ? `rank-${row.rank}` : ''}`}>#{row.rank}</span>
                        <span className="cd-lb-name">{row.name} {row.userId === currentUserId && '(You)'}</span>
                      </div>
                      <div className="cd-lb-score">
                        <span className="pts">{row.score} pts</span>
                        <span className="slvd">{row.solvedCount} solved</span>
                      </div>
                    </div>
                  ))}
                  {leaderboard.length > 10 && (
                    <div className="cd-lb-more">
                      ...and {leaderboard.length - 10} more participants
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContestDetail;
