import React, { useMemo, useEffect, useState } from 'react';
import { useWorkspaceEngine } from './WorkspaceEngineContext';
import { DockviewAdapter } from '../adapters/dockview/DockviewAdapter';
import { workspaceCommandService } from '../services/CommandService';
import { workspacePersistenceService } from '../services/PersistenceService';
import { workspaceEventService, EventCategories } from '../services/EventService';
import { workspaceLifecycleManager } from './LifecycleManager';
import { WorkspaceErrorBoundary } from '../components/WorkspaceErrorBoundary';

/**
 * WorkspaceEngine Component
 */
const WorkspaceEngineInternal = ({ manifest: rawManifest }) => {
  const { state } = useWorkspaceEngine();
  const [isInitialized, setIsInitialized] = useState(false);

  const [manifest, setManifest] = useState(null);
  const [bootError, setBootError] = useState(null);

  // 1. Boot Sequence via LifecycleManager
  useEffect(() => {
    if (!rawManifest) return;
    
    let isMounted = true;
    workspaceLifecycleManager.boot(rawManifest)
      .then(m => {
        if (isMounted) setManifest(m);
      })
      .catch(err => {
        if (isMounted) setBootError(err);
      });

    return () => {
      isMounted = false;
    };
  }, [rawManifest]);

  // 2. Instantiate Adapter
  const adapter = useMemo(() => {
    if (!manifest) return null;
    const instance = new DockviewAdapter({});
    instance.initialize(manifest);
    return instance;
  }, [manifest]);

  useEffect(() => {
    if (!adapter) return;

    // Register adapter commands with the global CommandService
    const bindings = adapter.getCommandBindings();
    workspaceCommandService.registerAdapterBindings(bindings);

    // Setup persistence listening on LAYOUT.CHANGED
    const handleWorkspaceChange = (event) => {
      if (manifest && event.state) {
        workspacePersistenceService.saveLayout(manifest.id, event.state, manifest.version || 1);
      }
    };

    const unsubscribe = workspaceEventService.on(EventCategories.LAYOUT.CHANGED, handleWorkspaceChange);

    // Attempt to load layout on startup
    if (manifest) {
      const savedLayout = workspacePersistenceService.loadLayout(manifest.id, manifest.version || 1);
      if (savedLayout) {
        setTimeout(() => {
          try {
            workspaceCommandService.loadLayout(savedLayout);
          } catch (e) {
            console.error('Failed to load saved layout:', e);
            workspacePersistenceService.clearLayout(manifest.id);
          }
        }, 100);
      }
    }

    setIsInitialized(true);

    return () => {
      unsubscribe();
      adapter.destroy();
      workspaceLifecycleManager.shutdown();
      workspaceEventService.emit(EventCategories.WORKSPACE.UNMOUNTED);
    };
  }, [adapter, manifest]);

  if (bootError) {
    return <div className="workspace-engine-error-panel">Failed to load workspace. {bootError.message}</div>;
  }

  if (!manifest) {
    return <div className="coding-loader-wrapper"><div className="coding-spinner"></div>Booting Workspace Engine...</div>;
  }

  if (!adapter || !isInitialized) {
    return <div className="coding-loader-wrapper"><div className="coding-spinner"></div>Initializing Workspace Engine...</div>;
  }

  return (
    <div className="workspace-engine-container" style={{ width: '100%', height: '100%', display: 'flex' }}>
      {adapter.render()}
    </div>
  );
};

export const WorkspaceEngine = (props) => (
  <WorkspaceErrorBoundary>
    <WorkspaceEngineInternal {...props} />
  </WorkspaceErrorBoundary>
);
