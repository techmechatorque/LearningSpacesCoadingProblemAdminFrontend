import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api';
import {
  Trophy, Plus, Calendar, Users, BarChart2, Pencil,
  PackageOpen, CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';

const ContestsList = () => {
  const [contests, setContests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [releaseState, setReleaseState] = useState({}); // { [contestId]: 'idle' | 'loading' | 'done' | 'error' }
  const navigate = useNavigate();

  useEffect(() => {
    api.getContests()
      .then(data => setContests(data))
      .catch(err => setError(err.message || 'Failed to load contests'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ongoing':  return 'text-brand-secondary bg-brand-secondary/10 border-brand-secondary/20';
      case 'Upcoming': return 'text-brand-primary bg-brand-primary/10 border-brand-primary/20';
      case 'Past':     return 'text-dark-muted bg-dark-hover border-dark-border';
      default:         return 'text-white bg-dark-card border-dark-border';
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const handleReleaseProblems = async (contestId) => {
    setReleaseState(prev => ({ ...prev, [contestId]: 'loading' }));
    try {
      const result = await api.releaseContestProblems(contestId);
      setReleaseState(prev => ({ ...prev, [contestId]: 'done' }));
      // Brief toast then reset
      setTimeout(() => setReleaseState(prev => ({ ...prev, [contestId]: 'idle' })), 4000);
      alert(result.message);
    } catch (err) {
      setReleaseState(prev => ({ ...prev, [contestId]: 'error' }));
      alert(err.response?.data?.message || err.message || 'Failed to release problems');
      setTimeout(() => setReleaseState(prev => ({ ...prev, [contestId]: 'idle' })), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg text-brand-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
        <span className="ml-3 font-semibold">Loading Contests...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto p-8 space-y-8 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/40 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-brand-primary" />
              <span>Contests Management</span>
            </h1>
            <p className="text-sm text-dark-muted mt-1">Schedule, build, and view scores for DSA competitions</p>
          </div>
          <Link to="/admin/contests/create"
            className="inline-flex items-center space-x-2 bg-brand-primary text-black px-5 py-2.5 rounded-xl font-bold hover:bg-brand-primary/95 transition-all shadow-md shadow-brand-primary/10 active:scale-95">
            <Plus className="h-4.5 w-4.5" />
            <span>Create Contest</span>
          </Link>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger p-4 rounded-xl text-sm font-semibold">
            <AlertCircle className="h-5 w-5 shrink-0" /><span>{error}</span>
          </div>
        )}

        {/* Contests Grid */}
        {contests.length === 0 ? (
          <div className="text-center py-20 text-dark-muted text-sm bg-dark-card border border-dark-border/40 rounded-2xl">
            No contests scheduled yet. Click "Create Contest" to host your first competition!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {contests.map((contest) => {
              const releaseStatus = releaseState[contest._id] || 'idle';
              const canEdit    = contest.status !== 'Ongoing';
              const canRelease = contest.status === 'Past';

              return (
                <div key={contest._id}
                  className="bg-dark-card border border-dark-border/60 hover:border-dark-border p-6 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all duration-300 relative group">

                  {/* Left: contest info */}
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${getStatusColor(contest.status)}`}>
                        {contest.status}
                      </span>
                      <span className="text-[10px] font-bold text-dark-muted flex items-center space-x-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{contest.registeredCount || 0} Registered</span>
                      </span>
                      <span className="text-[10px] font-bold text-dark-muted">
                        {contest.problemCount || 0} Problem{contest.problemCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors truncate">
                        {contest.name}
                      </h3>
                      <p className="text-sm text-dark-muted max-w-2xl leading-relaxed line-clamp-2">
                        {contest.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6 text-xs text-dark-muted">
                      <span className="flex items-center space-x-1.5">
                        <Calendar className="h-4 w-4 text-brand-primary" />
                        <span>Start: {formatDate(contest.startTime)}</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <Calendar className="h-4 w-4 text-brand-primary" />
                        <span>End: {formatDate(contest.endTime)}</span>
                      </span>
                    </div>

                    {/* Past contest: release problems banner */}
                    {canRelease && (
                      <div className="bg-dark-bg/60 border border-dark-border/60 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-2 text-dark-muted">
                          <PackageOpen className="h-4 w-4 text-brand-primary shrink-0" />
                          <span>Contest has ended. Release contest-only problems to the <span className="text-white font-semibold">main practice pool</span> so all users can access them.</span>
                        </div>
                        <button
                          onClick={() => handleReleaseProblems(contest._id)}
                          disabled={releaseStatus === 'loading' || releaseStatus === 'done'}
                          className={`shrink-0 flex items-center space-x-1.5 px-4 py-2 rounded-xl font-bold transition-all hover:cursor-pointer border text-xs ${
                            releaseStatus === 'done'
                              ? 'bg-brand-secondary/10 border-brand-secondary/25 text-brand-secondary cursor-default'
                              : releaseStatus === 'loading'
                              ? 'bg-dark-hover border-dark-border text-dark-muted cursor-wait'
                              : 'bg-brand-primary/10 border-brand-primary/25 text-brand-primary hover:bg-brand-primary hover:text-black'
                          }`}>
                          {releaseStatus === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          {releaseStatus === 'done'    && <CheckCircle className="h-3.5 w-3.5" />}
                          {releaseStatus === 'idle' || releaseStatus === 'error'
                            ? <PackageOpen className="h-3.5 w-3.5" />
                            : null}
                          <span>
                            {releaseStatus === 'loading' ? 'Releasing...' :
                             releaseStatus === 'done'    ? 'Released!'   :
                                                           'Release to Practice'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: action buttons */}
                  <div className="flex items-center space-x-3 shrink-0 pt-4 md:pt-0 border-t border-dark-border/40 md:border-0">
                    {/* Edit button – hidden for Ongoing contests */}
                    {canEdit && (
                      <button
                        onClick={() => navigate(`/admin/contests/${contest._id}/edit`)}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-dark-muted bg-dark-bg border border-dark-border px-4 py-2.5 rounded-xl hover:bg-dark-hover hover:text-white transition-all hover:cursor-pointer">
                        <Pencil className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    )}

                    {/* Leaderboard button */}
                    <button
                      onClick={() => navigate(`/admin/contests/${contest._id}/leaderboard`)}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/25 px-4 py-2.5 rounded-xl hover:bg-brand-primary hover:text-black transition-all hover:cursor-pointer">
                      <BarChart2 className="h-4 w-4" />
                      <span>Leaderboard</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
};

export default ContestsList;
