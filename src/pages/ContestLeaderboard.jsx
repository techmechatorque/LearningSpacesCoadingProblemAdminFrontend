import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { 
  Trophy, ArrowLeft, BarChart2, Calendar, Award, 
  ChevronDown, ChevronUp, Code, CheckCircle, XCircle, AlertTriangle, X 
} from 'lucide-react';

const ContestLeaderboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Admin Code Inspection State
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [viewingCode, setViewingCode] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const [lbData, contestData] = await Promise.all([
          api.getContestLeaderboard(id),
          api.getContestById(id),
        ]);
        
        setLeaderboard(lbData);
        setContest(contestData);
      } catch (err) {
        setError(err.message || 'Failed to load leaderboard details');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVerdictTextClass = (verdict) => {
    switch (verdict) {
      case 'Accepted': return 'text-brand-secondary';
      case 'Wrong Answer': return 'text-brand-danger';
      case 'Compilation Error': return 'text-amber-500';
      case 'Runtime Error':
      case 'Time Limit Exceeded':
      default: return 'text-brand-danger';
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'Accepted': return <CheckCircle className="h-3.5 w-3.5 mr-1 text-brand-secondary shrink-0" />;
      case 'Wrong Answer': return <XCircle className="h-3.5 w-3.5 mr-1 text-brand-danger shrink-0" />;
      default: return <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-500 shrink-0" />;
    }
  };

  const toggleExpandUser = (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg text-brand-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
        <span className="ml-3 font-semibold">Loading Leaderboard...</span>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in max-w-7xl mx-auto p-8 space-y-6 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/40 pb-5 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/contests')}
              className="bg-dark-card hover:bg-dark-hover border border-dark-border p-2 rounded-xl text-dark-muted hover:text-white transition-all hover:cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
                <BarChart2 className="h-8 w-8 text-brand-primary animate-pulse" />
                <span>Leaderboard: {contest?.name || 'Contest'}</span>
              </h1>
              <p className="text-sm text-dark-muted mt-1">Real-time rankings and participant scores (Click a participant to view their submitted code)</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger p-4 rounded-xl text-sm font-semibold">
            <span>{error}</span>
          </div>
        )}

        {/* Leaderboard Table */}
        {leaderboard.length === 0 ? (
          <div className="text-center py-20 text-dark-muted text-sm bg-dark-card border border-dark-border/40 rounded-2xl">
            No submissions or active registered users on the scoreboard yet.
          </div>
        ) : (
          <div className="overflow-hidden border border-dark-border rounded-2xl bg-dark-card shadow-md">
            <table className="min-w-full divide-y divide-dark-border text-left text-xs sm:text-sm">
              <thead className="bg-dark-hover/40 text-dark-muted font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Solved Problems</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Last Solve Time</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60 text-dark-text font-medium">
                {leaderboard.map((row) => (
                  <React.Fragment key={row.userId}>
                    <tr 
                      onClick={() => toggleExpandUser(row.userId)}
                      className={`hover:bg-dark-hover/10 transition-colors cursor-pointer ${
                        expandedUserId === row.userId ? 'bg-dark-hover/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        {row.rank === 1 ? (
                          <span className="inline-flex items-center space-x-1.5 text-brand-primary font-black">
                            <Trophy className="h-4.5 w-4.5 fill-current animate-bounce" />
                            <span>1st</span>
                          </span>
                        ) : row.rank === 2 ? (
                          <span className="text-brand-secondary font-extrabold">2nd</span>
                        ) : row.rank === 3 ? (
                          <span className="text-sky-400 font-extrabold">3rd</span>
                        ) : (
                          <span className="text-dark-muted font-bold">{row.rank}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        {row.name}
                      </td>
                      <td className="px-6 py-4 text-dark-muted">
                        {row.email}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {row.solvedCount}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1 text-brand-primary font-black">
                          <Award className="h-4 w-4 shrink-0" />
                          <span>{row.score}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-muted font-mono">
                        {formatDate(row.lastSolvedTime)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandUser(row.userId);
                          }}
                          className="text-brand-primary hover:text-white bg-transparent border-0 hover:cursor-pointer flex items-center space-x-1 ml-auto text-xs font-bold"
                        >
                          <span>{expandedUserId === row.userId ? 'Hide Submissions' : 'Inspect Code'}</span>
                          {expandedUserId === row.userId ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Submissions panel */}
                    {expandedUserId === row.userId && (
                      <tr>
                        <td colSpan={7} className="bg-dark-bg/60 p-6 border-b border-dark-border/40">
                          <div className="space-y-3">
                            <h3 className="text-xs uppercase font-extrabold text-white tracking-wider flex items-center space-x-2">
                              <Code className="h-4 w-4 text-brand-primary" />
                              <span>Code Submissions: {row.name}</span>
                            </h3>
                            
                            {!row.submissions || row.submissions.length === 0 ? (
                              <div className="text-xs text-dark-muted py-4 bg-dark-card/20 border border-dark-border/30 rounded-xl text-center">
                                No submissions recorded for this user during the contest.
                              </div>
                            ) : (
                              <div className="overflow-hidden border border-dark-border/55 rounded-xl bg-dark-card text-xs">
                                <table className="min-w-full divide-y divide-dark-border/50 text-left">
                                  <thead className="bg-dark-hover/30 text-dark-muted font-bold uppercase tracking-wider text-[10px]">
                                    <tr>
                                      <th className="px-4 py-2.5">Problem</th>
                                      <th className="px-4 py-2.5">Verdict</th>
                                      <th className="px-4 py-2.5">Language</th>
                                      <th className="px-4 py-2.5">Submitted At</th>
                                      <th className="px-4 py-2.5 text-right">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-dark-border/40 font-medium">
                                    {row.submissions.map((sub) => (
                                      <tr key={sub._id} className="hover:bg-dark-hover/10">
                                        <td className="px-4 py-2.5 text-white font-semibold">
                                          {sub.problemName}
                                        </td>
                                        <td className="px-4 py-2.5">
                                          <span className={`flex items-center font-bold ${getVerdictTextClass(sub.verdict)}`}>
                                            {getVerdictIcon(sub.verdict)}
                                            <span>{sub.verdict}</span>
                                          </span>
                                        </td>
                                        <td className="px-4 py-2.5 capitalize text-dark-muted font-mono text-[10px]">
                                          {sub.language}
                                        </td>
                                        <td className="px-4 py-2.5 text-dark-muted flex items-center space-x-1">
                                          <Calendar className="h-3.5 w-3.5 text-dark-muted shrink-0" />
                                          <span>{formatFullDate(sub.createdAt)}</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                          <button
                                            onClick={() => setViewingCode({
                                              code: sub.code,
                                              userName: row.name,
                                              problemName: sub.problemName,
                                              language: sub.language
                                            })}
                                            className="text-brand-primary hover:underline bg-transparent border-0 hover:cursor-pointer text-xs font-semibold"
                                          >
                                            View User Code
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Code Inspection Modal Overlay */}
      {viewingCode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-6">
          <div className="w-full max-w-3xl bg-dark-card border border-dark-border rounded-2xl flex flex-col h-[75vh] animate-fade-in overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark-hover/40">
              <div className="flex flex-col">
                <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
                  <Code className="h-5 w-5 text-brand-primary" />
                  <span>Submitted Code: {viewingCode.problemName}</span>
                </h3>
                <span className="text-[10px] text-dark-muted mt-0.5">Submitted by {viewingCode.userName} (Language: <span className="capitalize">{viewingCode.language}</span>)</span>
              </div>
              <button
                onClick={() => setViewingCode(null)}
                className="text-dark-muted hover:text-white bg-transparent border-0 hover:cursor-pointer flex items-center space-x-1.5 text-xs font-bold transition-colors"
              >
                <X className="h-4.5 w-4.5" />
                <span>Close</span>
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-dark-bg p-4 overflow-auto">
              <pre className="font-mono text-xs text-brand-secondary p-4 bg-dark-bg rounded-lg border border-dark-border/40 whitespace-pre-wrap overflow-x-auto leading-relaxed select-text">
                <code>{viewingCode.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContestLeaderboard;
