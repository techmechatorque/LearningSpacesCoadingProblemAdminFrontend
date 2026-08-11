import React from 'react';

export class ExtensionRegistry {
  constructor() {
    this.installedExtensions = new Map(); // id -> manifest
  }

  install(manifest) {
    if (this.installedExtensions.has(manifest.id)) {
      throw new Error(`Extension ${manifest.id} is already installed.`);
    }
    this.installedExtensions.set(manifest.id, manifest);
  }

  uninstall(extensionId) {
    this.installedExtensions.delete(extensionId);
  }

  getInstalled() {
    return Array.from(this.installedExtensions.values());
  }
}

export class MarketplaceProvider {
  constructor() {
    this.catalog = [
      {
        id: 'ecosystem.mock.theme',
        name: 'Mock Dark Theme',
        version: '1.0.0',
        description: 'A mock extension that contributes a Dark Theme command and toolbar button.',
        author: 'Platform Team',
        permissions: ['commands', 'toolbar'],
        dependencies: []
      },
      {
        id: 'ecosystem.mock.minimap',
        name: 'Editor MiniMap',
        version: '1.1.0',
        description: 'Provides a minimap panel for editors.',
        author: 'Platform Team',
        permissions: ['panels', 'commands'],
        dependencies: []
      }
    ];
  }

  async search(query) {
    // Mock network delay
    await new Promise(r => setTimeout(r, 300));
    const q = query.toLowerCase();
    return this.catalog.filter(ext => 
      ext.name.toLowerCase().includes(q) || ext.description.toLowerCase().includes(q)
    );
  }

  async getManifest(extensionId) {
    return this.catalog.find(e => e.id === extensionId);
  }

  // A mock loader to simulate dynamically downloading the extension module
  async downloadModule(extensionId) {
    await new Promise(r => setTimeout(r, 500));
    
    if (extensionId === 'ecosystem.mock.theme') {
      return {
        activate: async (api) => {
          api.registerCommand('theme.toggle', {
            title: 'Toggle Theme',
            handler: () => alert('Theme toggled!')
          });
          api.registerToolbarAction({
            id: 'toolbar.theme',
            title: 'Toggle Theme',
            command: 'theme.toggle'
          });
        }
      };
    }

    if (extensionId === 'ecosystem.mock.minimap') {
      return {
        activate: async (api) => {
          api.registerPanel('minimap.view', {
            component: () => <div style={{padding:'20px', color:'white'}}>MiniMap Panel</div>,
            metadata: { title: 'Mini Map' }
          });
          api.registerCommand('minimap.open', {
            title: 'Open MiniMap',
            handler: () => api.executeCommand('openPanel', 'minimap.view')
          });
        }
      };
    }

    throw new Error(`Module for ${extensionId} not found.`);
  }
}
