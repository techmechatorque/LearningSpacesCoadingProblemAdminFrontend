import React from 'react';

const HelloPanel = ({ pluginApi }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Hello, Workspace!</h2>
      <p>This panel was injected entirely via the Plugin API.</p>
      <button 
        onClick={() => pluginApi.executeCommand('openDiagnostics')}
        style={{ padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }}
      >
        Open Diagnostics
      </button>
    </div>
  );
};

export async function activate(pluginApi) {
  console.log('[HelloWorkspacePlugin] Activating...');

  // 1. Register a custom panel
  pluginApi.registerPanel('hello.world', {
    component: (props) => <HelloPanel pluginApi={pluginApi} {...props} />,
    capabilities: {
      canClose: true,
      canFloat: true,
      multiInstance: true
    },
    metadata: {
      title: 'Hello Plugin',
      category: 'demo'
    }
  });

  // 2. Register a command with metadata
  pluginApi.registerCommand('openHelloWorld', {
    title: 'Open Hello World Panel',
    category: 'Demo',
    keywords: ['hello', 'demo', 'test'],
    shortcut: 'Ctrl+Shift+H',
    handler: () => {
      pluginApi.executeCommand('openPanel', 'hello.world');
    }
  });

  // 3. Register a shortcut
  pluginApi.registerShortcut({
    keybinding: 'Ctrl+Shift+H',
    commandId: 'openHelloWorld'
  });

  // 4. Register a toolbar action
  pluginApi.registerToolbarAction({
    id: 'toolbar.hello',
    title: 'Say Hello',
    command: 'openHelloWorld'
  });
};
