import React, { useEffect, useState } from 'react';
import { ContributionRegistry } from './ContributionRegistry';
import { 
  CommandRegistry, ShortcutRegistry, ToolbarRegistry, 
  MenuRegistry, TemplateRegistry 
} from './Registries';

// --- Overlay Manager ---
// A simple context or store to manage which overlay is active (e.g. Command Palette)
export class OverlayManager {
  constructor() {
    this.activeOverlay = null;
    this.listeners = [];
  }
  open(overlayId) {
    this.activeOverlay = overlayId;
    this.notify();
  }
  close() {
    this.activeOverlay = null;
    this.notify();
  }
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  notify() {
    this.listeners.forEach(l => l(this.activeOverlay));
  }
}

const overlayManager = new OverlayManager();

// --- Command Palette UI ---
const CommandPaletteUI = ({ pluginApi, commandRegistry, overlayManager }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    return overlayManager.subscribe((active) => {
      setIsOpen(active === 'commandPalette');
      if (active === 'commandPalette') setFilter('');
    });
  }, [overlayManager]);

  if (!isOpen) return null;

  const commands = commandRegistry.getAll().filter(cmd => 
    cmd.title.toLowerCase().includes(filter.toLowerCase()) || 
    (cmd.keywords && cmd.keywords.some(k => k.toLowerCase().includes(filter.toLowerCase())))
  );

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', paddingTop: '10vh'
    }} onClick={() => overlayManager.close()}>
      <div 
        style={{ background: '#252526', width: '600px', borderRadius: '6px', padding: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        <input 
          autoFocus
          placeholder="Type a command..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ width: '100%', padding: '10px', boxSizing: 'border-box', background: '#3c3c3c', color: '#fff', border: '1px solid #007acc', borderRadius: '4px' }}
        />
        <div style={{ marginTop: '10px', maxHeight: '400px', overflowY: 'auto' }}>
          {commands.map(cmd => (
            <div 
              key={cmd.id} 
              onClick={() => {
                pluginApi.executeCommand(cmd.id);
                overlayManager.close();
              }}
              style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #333', color: '#ccc' }}
            >
              <strong>{cmd.title}</strong> 
              <span style={{ float: 'right', color: '#888', fontSize: '12px' }}>{cmd.shortcut}</span>
            </div>
          ))}
          {commands.length === 0 && <div style={{ padding: '10px', color: '#888' }}>No commands found.</div>}
        </div>
      </div>
    </div>
  );
};

// --- Toolbar UI ---
const ToolbarUI = ({ pluginApi, toolbarRegistry }) => {
  const [actions, setActions] = useState(toolbarRegistry.getAll());

  // Listen for new contributions or removals so toolbar updates dynamically
  useEffect(() => {
    const unsubRegister = pluginApi.subscribeEvent('system.contribution.register', (event) => {
      if (event.type === 'toolbar') {
        setActions(toolbarRegistry.getAll());
      }
    });
    const unsubUnregister = pluginApi.subscribeEvent('system.contribution.unregister', () => {
      setActions(toolbarRegistry.getAll());
    });
    return () => {
      unsubRegister();
      unsubUnregister();
    };
  }, [pluginApi, toolbarRegistry]);

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '8px', background: '#333', borderBottom: '1px solid #222' }}>
      {actions.map(action => (
        <button 
          key={action.id}
          onClick={() => pluginApi.executeCommand(action.command)}
          style={{ background: '#444', color: '#fff', border: 'none', padding: '4px 12px', cursor: 'pointer', borderRadius: '4px' }}
        >
          {action.title}
        </button>
      ))}
    </div>
  );
};


// --- Plugin Entry ---
export async function activate(pluginApi) {
  console.log('[ProductivityPlugin] Activating Productivity Framework...');

  // Initialize Registries
  const registries = {
    command: new CommandRegistry(),
    shortcut: new ShortcutRegistry(),
    toolbar: new ToolbarRegistry(),
    menu: new MenuRegistry(),
    template: new TemplateRegistry()
  };

  const contributionRegistry = new ContributionRegistry(registries);

  pluginApi.subscribeEvent('system.contribution.register', (event) => {
    contributionRegistry.handleContribution(event);
  });

  pluginApi.subscribeEvent('system.plugin.unloaded', (event) => {
    contributionRegistry.removeContributionsForPlugin(event.pluginId);
    
    // Trigger a refresh event for the toolbar (if we want explicit refresh, though we can just emit a dummy contribution event, or we can add a new event type. Actually, ToolbarUI listens to `system.contribution.register`. Let's emit `system.contribution.unregister` and have ToolbarUI listen to it).
    pluginApi.emitEvent('system.contribution.unregister', { pluginId: event.pluginId });
  });

  // 2. Global Shortcut Listener
  const handleKeyDown = (e) => {
    const matched = registries.shortcut.match(e);
    if (matched) {
      e.preventDefault();
      e.stopPropagation();
      pluginApi.executeCommand(matched.commandId);
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // 3. Register Global Overlay (Command Palette)
  // For standard rendering, we could inject this via a portal, or render it inside a dedicated panel.
  // We'll register an invisible panel that mounts the overlay globally.
  pluginApi.registerPanel('productivity.overlay', {
    component: () => <CommandPaletteUI pluginApi={pluginApi} commandRegistry={registries.command} overlayManager={overlayManager} />,
    capabilities: { multiInstance: false, canFloat: false, canClose: false },
    metadata: { title: 'Overlays', category: 'system' }
  });

  // Register Toolbar Panel
  pluginApi.registerPanel('productivity.toolbar', {
    component: () => <ToolbarUI pluginApi={pluginApi} toolbarRegistry={registries.toolbar} />,
    capabilities: { multiInstance: false, canFloat: false, canClose: false },
    metadata: { title: 'Toolbar', category: 'system' }
  });

  // 4. Register built-in Productivity Commands
  pluginApi.registerCommand('productivity.showCommandPalette', {
    title: 'Show Command Palette',
    category: 'Productivity',
    keywords: ['palette', 'commands', 'search'],
    handler: () => overlayManager.open('commandPalette')
  });

  pluginApi.registerShortcut({
    keybinding: 'Ctrl+Shift+P',
    commandId: 'productivity.showCommandPalette'
  });

  // Editor Commands
  pluginApi.registerCommand('editor.action.format', {
    title: 'Format Code',
    category: 'Editor',
    keywords: ['format', 'prettier', 'code'],
    handler: () => {
      pluginApi.emitEvent('editor.action.format', {});
    }
  });

  pluginApi.registerShortcut({
    keybinding: 'Ctrl+Shift+F',
    commandId: 'editor.action.format'
  });
};
