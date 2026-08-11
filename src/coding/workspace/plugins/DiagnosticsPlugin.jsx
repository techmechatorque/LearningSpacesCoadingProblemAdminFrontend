import React, { useEffect, useState } from 'react';

/**
 * Diagnostics Panel React Component
 * Subscribes to the sandboxed PluginAPI state and events to display diagnostics.
 */
const DiagnosticsPanel = ({ pluginApi }) => {
  const [state, setState] = useState(() => pluginApi.getWorkspaceState());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // 1. Subscribe to State changes
    const unsubscribeState = pluginApi.subscribeState((newState) => {
      setState(newState);
    });

    // 2. Subscribe to Event stream
    const unsubscribeEvents = pluginApi.subscribeEvent('*', (payload) => {
      setEvents(prev => [...prev, { time: new Date().toLocaleTimeString(), payload }].slice(-50));
    });

    return () => {
      unsubscribeState();
      unsubscribeEvents();
    };
  }, [pluginApi]);

  if (!state) return <div>Access Denied</div>;

  return (
    <div style={{ padding: '10px', fontSize: '12px', overflowY: 'auto', height: '100%' }}>
      <h3>Workspace Diagnostics</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>Session ID:</strong> {state.session?.id || 'None'} <br/>
        <strong>Mode:</strong> {state.session?.mode || 'None'} <br/>
        <strong>Registered Definitions:</strong> {Object.keys(state.definitions || {}).length} <br/>
        <strong>Active Instances:</strong> {Object.keys(state.instances || {}).length}
      </div>
      
      <h4>Recent Events</h4>
      <div style={{ background: '#1e1e1e', padding: '10px', borderRadius: '4px' }}>
        {events.map((e, i) => (
          <div key={i} style={{ borderBottom: '1px solid #333', padding: '4px 0' }}>
            <span style={{ color: '#888' }}>{e.time.split('T')[1].split('.')[0]}</span>{' '}
            <strong style={{ color: '#4CAF50' }}>{e.category}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * The actual Plugin definition.
 * Must export an `activate` function.
 */
export async function activate(pluginApi) {
  console.log('[DiagnosticsPlugin] Activating...');
  
  // Register the panel using the sandboxed API
  pluginApi.registerPanel('system.diagnostics', {
    component: (props) => <DiagnosticsPanel pluginApi={pluginApi} {...props} />,
    capabilities: {
      canClose: true,
      canFloat: true,
      multiInstance: false,
    },
    metadata: {
      title: 'Engine Diagnostics',
      category: 'system'
    }
  });

  // Register a command to quickly open the diagnostics panel
  pluginApi.registerCommand('openDiagnostics', () => {
    pluginApi.executeCommand('openPanel', 'system.diagnostics');
  });
};
