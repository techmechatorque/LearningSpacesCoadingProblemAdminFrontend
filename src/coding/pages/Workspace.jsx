import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock } from 'lucide-react';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { useLocation } from 'react-router-dom';
import { ProblemWorkspaceManifest } from '../workspace/ProblemManifest';
import { WorkspaceEngine, WorkspaceEngineProvider } from '../workspace-engine';
import '../styles/coding.css';
import './Workspace.css';

const WorkspaceLayout = () => {
  const { contestDetail, loading, workspaceError, selectedProblemId, problemDetail } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!contestDetail) return;
    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(contestDetail.startTime);
      const end = new Date(contestDetail.endTime);
      if (now < start) setTimeRemaining(`Starts in: ${formatDuration(start - now)}`);
      else if (now >= start && now <= end) setTimeRemaining(`Ends in: ${formatDuration(end - now)}`);
      else setTimeRemaining('Contest Ended');
    }, 1000);
    return () => clearInterval(timer);
  }, [contestDetail]);

  const formatDuration = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="coding-loader-wrapper"><div className="coding-spinner"></div>Loading workspace...</div>;
  }

  if (workspaceError) {
    return <div style={{ color: 'red', padding: '20px', backgroundColor: 'black' }}>{workspaceError}</div>;
  }

  // Temporary debug UI
  if (location.search.includes('debug=true')) {
    return (
      <div style={{ color: 'white', padding: '20px', backgroundColor: 'black' }}>
        <h3>Debug Info</h3>
        <p>URL Search: {location.search}</p>
        <p>Selected Problem ID: {selectedProblemId || 'null'}</p>
        <p>Problem Detail exists: {problemDetail ? 'yes' : 'no'}</p>
      </div>
    );
  }

  return (
    <div className="coding-workspace" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {contestDetail && (
        <div className="workspace-contest-banner">
          <div className="workspace-contest-info">
            <Trophy className="workspace-icon-sm workspace-icon-primary" /> Competing in Contest: <strong className="workspace-text-primary">{contestDetail.name}</strong> • <Clock className="workspace-icon-xs workspace-icon-primary" /> {timeRemaining}
          </div>
          <button className="workspace-contest-back" onClick={() => navigate('/coding/contests')}>Back to Contests</button>
        </div>
      )}
      
      <div style={{ flex: 1, position: 'relative' }}>
        <WorkspaceEngineProvider>
          <WorkspaceEngine manifest={ProblemWorkspaceManifest} />
        </WorkspaceEngineProvider>
      </div>
    </div>
  );
};

// Main Entry Point
const Workspace = () => {
  return (
    <WorkspaceProvider>
      <WorkspaceLayout />
    </WorkspaceProvider>
  );
};

export default Workspace;
