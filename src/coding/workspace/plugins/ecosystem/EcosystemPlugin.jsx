import React, { useState, useEffect } from 'react';
import { ExtensionRegistry, MarketplaceProvider } from './Marketplace.jsx';

const ExtensionManagerUI = ({ pluginApi, platformApi, registry, marketplace }) => {
  const [activeTab, setActiveTab] = useState('installed');
  const [installedExtensions, setInstalledExtensions] = useState([]);
  const [loadedExtensionIds, setLoadedExtensionIds] = useState(new Set());
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshState = () => {
    setInstalledExtensions(registry.getInstalled());
    setLoadedExtensionIds(new Set(platformApi.getLoadedExtensions().map(e => e.id)));
  };

  useEffect(() => {
    refreshState();
    
    // Auto refresh when an extension is loaded or unloaded
    const unsubLoaded = pluginApi.subscribeEvent('system.extension.loaded', refreshState);
    const unsubUnloaded = pluginApi.subscribeEvent('system.extension.unloaded', refreshState);
    return () => { unsubLoaded(); unsubUnloaded(); };
  }, [registry, platformApi]);

  const handleSearch = async () => {
    const results = await marketplace.search(searchQuery);
    setSearchResults(results);
  };

  const handleInstall = async (extensionId) => {
    try {
      const manifest = await marketplace.getManifest(extensionId);
      if (!manifest) throw new Error('Extension not found.');
      
      // Validation & Dependency check placeholder
      console.log(`[Ecosystem] Validating permissions for ${manifest.id}:`, manifest.permissions);

      // Install in registry
      registry.install(manifest);
      
      // Hot Load
      const moduleLoader = await marketplace.downloadModule(manifest.id);
      await platformApi.loadExtension(manifest, moduleLoader);
      
      alert(`Extension ${manifest.name} installed successfully!`);
      refreshState();
    } catch (e) {
      alert(`Install failed: ${e.message}`);
    }
  };

  const handleUninstall = async (extensionId) => {
    try {
      if (loadedExtensionIds.has(extensionId)) {
        await platformApi.unloadExtension(extensionId);
      }
      registry.uninstall(extensionId);
      refreshState();
    } catch (e) {
      alert(`Uninstall failed: ${e.message}`);
    }
  };

  const handleToggle = async (extensionId, enable) => {
    try {
      if (enable) {
        const manifest = registry.getInstalled().find(e => e.id === extensionId);
        const moduleLoader = await marketplace.downloadModule(extensionId);
        await platformApi.loadExtension(manifest, moduleLoader);
      } else {
        await platformApi.unloadExtension(extensionId);
      }
      refreshState();
    } catch (e) {
      alert(`Toggle failed: ${e.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', color: '#fff', height: '100%', overflowY: 'auto' }}>
      <h2>Extension Manager</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('installed')} style={{ padding: '8px', background: activeTab === 'installed' ? '#007acc' : '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>Installed</button>
        <button onClick={() => setActiveTab('marketplace')} style={{ padding: '8px', background: activeTab === 'marketplace' ? '#007acc' : '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>Marketplace</button>
      </div>

      {activeTab === 'installed' && (
        <div>
          <h3>Installed Extensions</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {installedExtensions.map(ext => {
              const isLoaded = loadedExtensionIds.has(ext.id);
              return (
                <li key={ext.id} style={{ background: '#252526', padding: '15px', marginBottom: '10px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{ext.name}</strong> <span style={{ color: '#888', fontSize: '12px' }}>v{ext.version}</span>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#ccc' }}>{ext.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleToggle(ext.id, !isLoaded)}
                        style={{ padding: '6px 12px', background: isLoaded ? '#444' : '#007acc', color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        {isLoaded ? 'Disable' : 'Enable'}
                      </button>
                      <button 
                        onClick={() => handleUninstall(ext.id)}
                        style={{ padding: '6px 12px', background: 'transparent', color: '#f44336', border: '1px solid #f44336', cursor: 'pointer' }}
                      >
                        Uninstall
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#007acc' }}>
                    Permissions: {ext.permissions?.join(', ') || 'None'}
                  </div>
                </li>
              )
            })}
            {installedExtensions.length === 0 && <p style={{ color: '#888' }}>No extensions installed.</p>}
          </ul>
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div>
          <h3>Marketplace</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search extensions..."
              style={{ padding: '8px', background: '#1e1e1e', color: '#fff', border: '1px solid #444', flex: 1 }}
            />
            <button onClick={handleSearch} style={{ padding: '8px 16px', background: '#007acc', color: '#fff', border: 'none', cursor: 'pointer' }}>Search</button>
          </div>
          
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {searchResults.map(ext => {
              const isInstalled = registry.getInstalled().some(e => e.id === ext.id);
              return (
                <li key={ext.id} style={{ background: '#252526', padding: '15px', marginBottom: '10px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{ext.name}</strong> <span style={{ color: '#888', fontSize: '12px' }}>v{ext.version}</span>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#ccc' }}>{ext.description}</p>
                    </div>
                    <button 
                      onClick={() => handleInstall(ext.id)}
                      disabled={isInstalled}
                      style={{ padding: '6px 16px', background: isInstalled ? '#444' : '#007acc', color: '#fff', border: 'none', cursor: isInstalled ? 'default' : 'pointer' }}
                    >
                      {isInstalled ? 'Installed' : 'Install'}
                    </button>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                    Requires: {ext.permissions?.join(', ') || 'None'}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  );
};


export async function activate(pluginApi) {
  console.log('[EcosystemPlugin] Activating Extension Platform...');

  // 1. Get the highly privileged Platform API
  const platformApi = pluginApi.getExtensionPlatform();
  const registry = new ExtensionRegistry();
  const marketplace = new MarketplaceProvider();

  // 2. Load already "installed" plugins from Registry/Storage (mocking a clean state for now)
  // ...

  // 3. Register the Extension Manager Panel
  pluginApi.registerPanel('ecosystem.manager', {
    component: () => <ExtensionManagerUI pluginApi={pluginApi} platformApi={platformApi} registry={registry} marketplace={marketplace} />,
    capabilities: { multiInstance: false, canFloat: true, canClose: true },
    metadata: { title: 'Extensions', category: 'system' }
  });

  // 4. Register Commands & Toolbar actions
  pluginApi.registerCommand('ecosystem.showManager', {
    title: 'Manage Extensions',
    category: 'Ecosystem',
    handler: () => pluginApi.executeCommand('openPanel', 'ecosystem.manager')
  });

  pluginApi.registerToolbarAction({
    id: 'toolbar.extensions',
    title: 'Extensions',
    command: 'ecosystem.showManager'
  });
};
