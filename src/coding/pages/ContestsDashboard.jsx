import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/codingApi';
import '../styles/coding.css';
import './ContestsDashboard.css';
import { Trophy, Clock, Award, CheckCircle, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';

const ContestsDashboard = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [selectedContestId, setSelectedContestId] = useState(null);
  const [contestDetail, setContestDetail] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  
  const [timeRemaining, setTimeRemaining] = useState('');
  const timerRef = useRef(null);

  // Grab user from LMS redux state
  const { user } = useSelector(state => state.auth || { user: null });
  const currentUserId = user?._id || user?.id || '';

  useEffect(() => {
    const fetchContestsList = async () => {
      try {
        const data = await api.getContests();
        setContests(data);
        if (data.length > 0) setSelectedContestId(data[0]._id);
        else setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch contests');
        setLoading(false);
      }
    };
    fetchContestsList();
  }, []);

  useEffect(() => {
    if (!selectedContestId) return;
    const fetchDetail = async () => {
      setLoadingDetail(true);
      setError('');
      try {
        const detail = await api.getContestById(selectedContestId);
        setContestDetail(detail);
        const lb = await api.getContestLeaderboard(selectedContestId);
        setLeaderboard(lb);
      } catch (err) {
        setError(err.message || 'Failed to load details');
      } finally {
        setLoadingDetail(false);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [selectedContestId]);

  useEffect(() => {
    if (!contestDetail) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const updateTimer = () => {
      const now = new Date();
      const start = new Date(contestDetail.startTime);
      const end = new Date(contestDetail.endTime);
      if (now < start) setTimeRemaining(`Starts in: ${formatDuration(start - now)}`);
      else if (now >= start && now <= end) setTimeRemaining(`Ends in: ${formatDuration(end - now)}`);
      else setTimeRemaining('Contest Ended');
    };
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => clearInterval(timerRef.current);
  }, [contestDetail]);

  const formatDuration = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRegister = async () => {
    if (!contestDetail) return;
    setRegistering(true);
    setError('');
    try {
      await api.registerContest(contestDetail._id);
      setContestDetail({ ...contestDetail, isRegistered: true });
      setContests(contests.map(c => c._id === contestDetail._id ? { ...c, isRegistered: true, registeredCount: c.registeredCount + 1 } : c));
      const lb = await api.getContestLeaderboard(contestDetail._id);
      setLeaderboard(lb);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const userRankStats = leaderboard.find(row => row.userId === currentUserId);

  if (loading) {
    return (
      <div className="coding-app coding-loader-wrapper">
        <div className="coding-spinner"></div>
        <span>Loading Contests...</span>
      </div>
    );
  }

  return (
    <div className="coding-workspace contests-dashboard-layout">
      {/* Left Sidebar - Contests List */}
      <div className="coding-workspace-left contests-sidebar">
        <h2 className="contests-sidebar-title">
          <Trophy className="contests-icon-trophy" /> Contests
        </h2>
        {contests.length === 0 ? (
          <p className="contests-empty-msg">No contests scheduled.</p>
        ) : (
          <div className="contests-list">
            {contests.map((c) => {
              const isSelected = selectedContestId === c._id;
              return (
                <div 
                  key={c._id}
                  onClick={() => setSelectedContestId(c._id)}
                  className={`contest-list-item ${isSelected ? 'active' : ''}`}
                >
                  <div className="contest-item-header">
                    <span className={`coding-badge ${c.status === 'Ongoing' ? 'medium' : c.status === 'Upcoming' ? 'easy' : 'unsolved'} contest-status-badge`}>{c.status}</span>
                    {c.isRegistered && <CheckCircle className="contests-icon-check" />}
                  </div>
                  <strong className="contest-item-title">{c.name}</strong>
                  <span className="contest-item-time">{formatDate(c.startTime)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Area - Contest Details */}
      <div className="coding-workspace-right contests-detail-area">
        {error && <div className="contests-error">{error}</div>}
        
        {loadingDetail ? (
          <div className="coding-loader-wrapper"><div className="coding-spinner"></div></div>
        ) : contestDetail ? (
          <div className="contests-detail-container">
            
            {/* Header */}
            <div className="coding-stat-card glow contests-detail-header">
              <div>
                <div className="contests-status-row">
                  <span className={`coding-badge ${contestDetail.status === 'Ongoing' ? 'medium' : contestDetail.status === 'Upcoming' ? 'easy' : 'unsolved'}`}>{contestDetail.status}</span>
                  <span className="contests-timer"><Clock className="contests-icon-clock"/> {timeRemaining}</span>
                </div>
                <h1 className="contests-main-title">{contestDetail.name}</h1>
                <p className="contests-description">{contestDetail.description}</p>
                <div className="contests-times">
                  <span>Start: {formatDate(contestDetail.startTime)}</span>
                  <span>End: {formatDate(contestDetail.endTime)}</span>
                </div>
              </div>

              <div>
                {!contestDetail.isRegistered && contestDetail.status !== 'Past' ? (
                  <button className="coding-btn coding-btn-primary" onClick={handleRegister} disabled={registering}>
                    {registering ? 'Registering...' : <><Award className="contests-icon-award"/> Register for Contest</>}
                  </button>
                ) : contestDetail.status === 'Ongoing' ? (
                  <span className="coding-badge solved">You are participating</span>
                ) : contestDetail.status === 'Past' ? (
                  <span className="coding-badge unsolved">Contest Finished</span>
                ) : (
                  <span className="coding-badge easy">Registered (Waiting)</span>
                )}
              </div>
            </div>

            {/* Rank / Score */}
            {contestDetail.isRegistered && (contestDetail.status === 'Upcoming' || userRankStats) && (
              <div className="contests-stats-grid">
                <div>
                  <div className="coding-stat-title">Your Rank</div>
                  <div className="coding-stat-value contests-rank-val">{contestDetail.status === 'Upcoming' ? 'NA' : `#${userRankStats?.rank || '-'}`}</div>
                </div>
                <div>
                  <div className="coding-stat-title">Your Score</div>
                  <div className="coding-stat-value contests-score-val">{contestDetail.status === 'Upcoming' ? 'NA' : `${userRankStats?.score || 0} pts`}</div>
                </div>
                <div>
                  <div className="coding-stat-title">Solved</div>
                  <div className="coding-stat-value contests-solved-val">{contestDetail.status === 'Upcoming' ? 'NA' : `${userRankStats?.solvedCount || 0} / ${contestDetail.problems.length}`}</div>
                </div>
              </div>
            )}

            {/* Problems and Leaderboard */}
            <div className="contests-bottom-grid">
              <div>
                <h3 className="contests-section-title">Problems</h3>
                {contestDetail.status === 'Upcoming' ? (
                  <div className="contests-upcoming-msg">
                    Problems visible when contest starts.
                  </div>
                ) : (
                  <div className="contests-problems-list">
                    {contestDetail.problems.map(prob => (
                      <div key={prob._id} className="contests-problem-item">
                        <div>
                          <strong className="contests-problem-name">{prob.name}</strong>
                          <div className="contests-problem-meta">
                            {prob.category} • <span className={`difficulty-${prob.difficulty.toLowerCase()}`}>{prob.difficulty}</span>
                          </div>
                        </div>
                        <button className="coding-btn coding-btn-outline" onClick={() => navigate(`/coding/workspace/${prob.slug || prob._id}?contestId=${contestDetail._id}`)}>
                          Solve <ChevronRight className="contests-icon-chevron"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="contests-section-title">Scoreboard</h3>
                <div className="contests-scoreboard-container">
                  {leaderboard.length === 0 ? (
                    <div className="contests-no-participants">No participants yet.</div>
                  ) : (
                    <div className="contests-scoreboard-list">
                      {leaderboard.map(row => (
                        <div key={row.userId} className="contests-scoreboard-row">
                          <div className="contests-scoreboard-user">
                            <span className={`contests-scoreboard-rank ${row.rank === 1 ? 'rank-1' : ''}`}>#{row.rank}</span>
                            <span className="contests-scoreboard-name">{row.name}</span>
                          </div>
                          <div className="contests-scoreboard-score-info">
                            <div className="contests-scoreboard-score">{row.score} pts</div>
                            <div className="contests-scoreboard-solved">{row.solvedCount} solved</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ContestsDashboard;
