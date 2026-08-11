import React, { useEffect, useState } from 'react';
import { WorkspaceManager } from './WorkspaceManager';

// --- UI Components ---

const CrashRecoveryDialog = ({ pluginApi, savedSession, onResolve }) => {
  if (!savedSession) return null;
  
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#252526', padding: '20px', borderRadius: '8px', maxWidth: '400px', color: '#fff' }}>
        <h3>Unsaved Session Detected</h3>
        <p>It looks like you have an unsaved workspace session from {new Date(savedSession.timestamp).toLocaleString()}. Would you like to restore it?</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => onResolve(false)}
            style={{ padding: '8px 16px', background: '#444', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
          >Discard</button>
          <button 
            onClick={() => onResolve(true)}
            style={{ padding: '8px 16px', background: '#007acc', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
          >Restore Session</button>
        </div>
      </div>
    </div>
  );
};

const WorkspaceManagerPanel = ({ pluginApi, manager }) => {
  const [presets, setPresets] = useState([]);
  const [history, setHistory] = useState([]);
  const [newPresetName, setNewPresetName] = useState('');

  useEffect(() => {
    manager.getPresets().then(setPresets);
    manager.getHistory().then(setHistory);

    const unsubPresets = pluginApi.subscribeEvent('system.management.presets_updated', setPresets);
    const unsubHistory = pluginApi.subscribeEvent('system.management.history_updated', setHistory);
    return () => { unsubPresets(); unsubHistory(); };
  }, [manager, pluginApi]);

  const handleSaveCurrentAsPreset = async () => {
    if (!newPresetName.trim()) return;
    const currentState = pluginApi.executeCommand('saveLayout');
    await manager.savePreset(newPresetName, currentState);
    setNewPresetName('');
  };

  const handleExport = () => {
    const currentState = pluginApi.executeCommand('saveLayout');
    const pkg = manager.createExportPackage(currentState);
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspace-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const pkg = JSON.parse(event.target.result);
          manager.validateImportPackage(pkg);
          pluginApi.executeCommand('loadLayout', pkg.layout);
        } catch (err) {
          alert(`Import failed: ${err.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div style={{ padding: '20px', color: '#fff', overflowY: 'auto', height: '100%' }}>
      <h2>Workspace Manager</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleExport} style={{ padding: '6px 12px', background: '#333', color: '#fff', border: '1px solid #555' }}>Export Workspace</button>
        <button onClick={handleImport} style={{ padding: '6px 12px', background: '#333', color: '#fff', border: '1px solid #555' }}>Import Workspace</button>
      </div>

      <hr style={{ borderColor: '#444' }} />

      <h3>Presets</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input 
          placeholder="New preset name..." 
          value={newPresetName} onChange={e => setNewPresetName(e.target.value)}
          style={{ padding: '6px', background: '#222', color: '#fff', border: '1px solid #444', flex: 1 }}
        />
        <button onClick={handleSaveCurrentAsPreset} style={{ padding: '6px 12px', background: '#007acc', color: '#fff', border: 'none' }}>Save</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {presets.map(p => (
          <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#252526', marginBottom: '5px' }}>
            <span>{p.name}</span>
            <div>
              <button onClick={() => pluginApi.executeCommand('loadLayout', p.layout)} style={{ marginRight: '10px', background: 'transparent', color: '#007acc', border: 'none', cursor: 'pointer' }}>Load</button>
              <button onClick={() => manager.deletePreset(p.id)} style={{ background: 'transparent', color: '#f44336', border: 'none', cursor: 'pointer' }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <hr style={{ borderColor: '#444' }} />

      <h3>Session History (Snapshots)</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {[...history].reverse().map(h => (
          <li key={h.id} style={{ padding: '8px', borderBottom: '1px solid #333', fontSize: '12px' }}>
            <strong>{new Date(h.timestamp).toLocaleTimeString()}</strong> - {h.action}
            <button 
              onClick={() => pluginApi.executeCommand('loadLayout', h.layout)} 
              style={{ float: 'right', background: 'transparent', color: '#007acc', border: 'none', cursor: 'pointer' }}
            >Restore</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- Plugin Entry ---
export async function activate(pluginApi) {
  console.log('[WorkspaceManagementPlugin] Activating...');

  const manager = new WorkspaceManager(pluginApi);
  
  // 1. Crash Recovery Hook
  // We need to render a dialog overlay if a crash recovery exists.
  // We'll register a special hidden panel that checks this on mount.
  let resolvedRecovery = false;

  const RecoveryWrapper = () => {
    const [recoverySession, setRecoverySession] = useState(null);

    useEffect(() => {
      manager.checkForCrashRecovery().then(session => {
        if (session && !resolvedRecovery) {
          setRecoverySession(session);
        } else {
          resolvedRecovery = true;
        }
      });
    }, []);

    const handleResolve = (restore) => {
      if (restore && recoverySession) {
        pluginApi.executeCommand('loadLayout', recoverySession.layout);
        manager.saveSnapshot(recoverySession.layout, 'Session Restored');
      } else if (!restore) {
        manager.clearSession();
      }
      setRecoverySession(null);
      resolvedRecovery = true;
    };

    return <CrashRecoveryDialog pluginApi={pluginApi} savedSession={recoverySession} onResolve={handleResolve} />;
  };

  pluginApi.registerPanel('management.recovery', {
    component: RecoveryWrapper,
    capabilities: { multiInstance: false, canFloat: false, canClose: false },
    metadata: { title: 'Recovery', category: 'system' }
  });

  // Check for crash recovery immediately
  manager.checkForCrashRecovery().then(session => {
    if (session) {
      pluginApi.executeCommand('openPanel', 'management.recovery');
    } else {
      resolvedRecovery = true; // Mark as resolved so auto-save can start
    }
  });

  // 2. Register Workspace Manager Panel
  pluginApi.registerPanel('management.manager', {
    component: () => <WorkspaceManagerPanel pluginApi={pluginApi} manager={manager} />,
    capabilities: { multiInstance: false, canFloat: true, canClose: true },
    metadata: { title: 'Workspace Manager', category: 'management' }
  });

  // 3. Register Commands
  pluginApi.registerCommand('workspace.showManager', {
    title: 'Show Workspace Manager',
    category: 'Workspace',
    handler: () => pluginApi.executeCommand('openPanel', 'management.manager')
  });

  pluginApi.registerCommand('workspace.export', {
    title: 'Export Workspace',
    category: 'Workspace',
    handler: () => {
      const currentState = pluginApi.executeCommand('saveLayout');
      const pkg = manager.createExportPackage(currentState);
      const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });

  // 4. Register Toolbar Actions
  pluginApi.registerToolbarAction({
    id: 'toolbar.manager',
    title: 'Workspace Manager',
    command: 'workspace.showManager'
  });

  pluginApi.registerToolbarAction({
    id: 'toolbar.export',
    title: 'Export',
    command: 'workspace.export'
  });

  // 5. Listen to Layout Changes for Auto-Save
  pluginApi.subscribeEvent('layout.changed', (payload) => {
    // Only track if recovery has been resolved (we don't want to auto-save while the prompt is up)
    if (resolvedRecovery) {
      manager.handleLayoutChange(payload.state);
    }
  });
};
