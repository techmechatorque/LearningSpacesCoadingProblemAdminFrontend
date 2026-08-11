import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { workspaceStore } from '../store/WorkspaceStore';

const WorkspaceEngineContext = createContext(null);

export const WorkspaceEngineProvider = ({ children }) => {
  const [state, setState] = useState(workspaceStore.getState());

  useEffect(() => {
    // Subscribe to store updates
    const unsubscribe = workspaceStore.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  return (
    <WorkspaceEngineContext.Provider value={{ state }}>
      {children}
    </WorkspaceEngineContext.Provider>
  );
};

export const useWorkspaceEngine = () => {
  const context = useContext(WorkspaceEngineContext);
  if (!context) {
    throw new Error('useWorkspaceEngine must be used within a WorkspaceEngineProvider');
  }
  return context;
};
