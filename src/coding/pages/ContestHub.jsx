import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/codingApi';
import '../styles/coding.css';
import './ContestHub.css';
import { Trophy, Clock, Users, ArrowRight, BookOpen, Calendar, CheckCircle } from 'lucide-react';

const ContestHub = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'ongoing', 'past'

  useEffect(() => {
    const fetchContestsList = async () => {
      try {
        const data = await api.getContests();
        setContests(data);
        
        // Auto-select tab based on available contests
        const hasOngoing = data.some(c => c.status === 'Ongoing');
        const hasUpcoming = data.some(c => c.status === 'Upcoming');
        
        if (hasOngoing) setActiveTab('ongoing');
        else if (hasUpcoming) setActiveTab('upcoming');
        else setActiveTab('past');
      } catch (err) {
        setError(err.message || 'Failed to fetch contests');
      } finally {
        setLoading(false);
      }
    };
    fetchContestsList();
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  const renderContestCard = (contest) => {
    return (
      <div key={contest._id} className={`contest-hub-card status-${contest.status.toLowerCase()}`}>
        <div className="contest-card-header">
          <span className={`coding-badge ${contest.status === 'Ongoing' ? 'medium' : contest.status === 'Upcoming' ? 'easy' : 'unsolved'}`}>
            {contest.status}
          </span>
          {contest.isRegistered && (
            <span className="registered-badge">
              <CheckCircle size={14} /> Registered
            </span>
          )}
        </div>
        
        <h3 className="contest-card-title">{contest.name}</h3>
        <p className="contest-card-desc">{contest.description || 'Join this competitive programming contest to test your skills.'}</p>
        
        <div className="contest-card-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span>{formatDate(contest.startTime)}</span>
          </div>
          <div className="meta-item">
            <Clock size={16} />
            <span>{formatDuration(contest.durationMinutes)}</span>
          </div>
          <div className="meta-item">
            <BookOpen size={16} />
            <span>{contest.problemCount || 0} Problems</span>
          </div>
          <div className="meta-item">
            <Users size={16} />
            <span>{contest.registeredCount || 0} Participants</span>
          </div>
        </div>

        <div className="contest-card-footer">
          <button 
            className={`coding-btn coding-btn-block ${contest.status === 'Ongoing' ? 'coding-btn-primary' : contest.status === 'Upcoming' && !contest.isRegistered ? 'coding-btn-primary' : 'coding-btn-outline'}`}
            onClick={() => navigate(`/coding/contests/${contest._id}`)}
          >
            {contest.status === 'Past' ? 'View Results' : (contest.status === 'Ongoing' ? (contest.isRegistered ? 'Enter Contest' : 'Register & Enter') : (contest.isRegistered ? 'View Details' : 'Register'))}
          </button>
        </div>
      </div>
    );
  };

  const filteredContests = contests.filter(c => c.status.toLowerCase() === activeTab);

  if (loading) {
    return (
      <div className="coding-app coding-loader-wrapper">
        <div className="coding-spinner"></div>
        <span>Loading Contest Hub...</span>
      </div>
    );
  }

  // Find featured contest (either first ongoing, or first upcoming)
  const featuredContest = contests.find(c => c.status === 'Ongoing') || contests.find(c => c.status === 'Upcoming');

  return (
    <div className="contest-hub-container">
      {/* Hero Banner */}
      <div className="contest-hero">
        <div className="contest-hero-content">
          <h1>Competitive Programming Contests</h1>
          <p>Compete with others, improve your coding skills, and climb the global leaderboard in our regular timed contests.</p>
          {featuredContest && (
            <div className="contest-hero-featured">
              <div className="featured-info">
                <span className={`coding-badge ${featuredContest.status === 'Ongoing' ? 'medium' : 'easy'}`}>Next Up: {featuredContest.status}</span>
                <h2>{featuredContest.name}</h2>
                <div className="featured-meta">
                  <span><Calendar size={16} /> {formatDate(featuredContest.startTime)}</span>
                  <span><Clock size={16} /> {formatDuration(featuredContest.durationMinutes)}</span>
                </div>
              </div>
              <button 
                className="coding-btn coding-btn-primary"
                onClick={() => navigate(`/coding/contests/${featuredContest._id}`)}
              >
                {featuredContest.status === 'Ongoing' ? 'Enter Now' : 'View Details'} <ArrowRight size={18} style={{marginLeft: '8px'}} />
              </button>
            </div>
          )}
        </div>
        <div className="contest-hero-graphic">
          <Trophy size={120} className="hero-trophy-icon" />
        </div>
      </div>

      {error && <div className="coding-alert-error" style={{margin: '0 2rem'}}>{error}</div>}

      {/* Tabs */}
      <div className="contest-tabs-wrapper">
        <div className="contest-tabs">
          <button 
            className={`contest-tab ${activeTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            Ongoing <span className="tab-count">{contests.filter(c => c.status === 'Ongoing').length}</span>
          </button>
          <button 
            className={`contest-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming <span className="tab-count">{contests.filter(c => c.status === 'Upcoming').length}</span>
          </button>
          <button 
            className={`contest-tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past <span className="tab-count">{contests.filter(c => c.status === 'Past').length}</span>
          </button>
        </div>
      </div>

      {/* Contest Grid */}
      <div className="contest-grid-container">
        {filteredContests.length === 0 ? (
          <div className="contest-empty-state">
            <Trophy size={48} className="empty-icon" />
            <h3>No {activeTab} contests found</h3>
            <p>Check back later for new programming challenges.</p>
          </div>
        ) : (
          <div className="contest-card-grid">
            {filteredContests.map(renderContestCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestHub;
