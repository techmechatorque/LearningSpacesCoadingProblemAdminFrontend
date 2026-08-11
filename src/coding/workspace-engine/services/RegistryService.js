import { workspaceEventService, EventCategories } from './EventService';
import { workspaceStore } from '../store/WorkspaceStore';

class RegistryService {
  constructor() {
    this.panelDefinitions = new Map();
  }

  /**
   * Register multiple panels from a manifest.
   * @param {Object} manifest
   */
  registerFromManifest(manifest) {
    if (!manifest || !manifest.panels) return;
    
    Object.entries(manifest.panels).forEach(([id, componentOrConfig]) => {
      let config = componentOrConfig;
      if (typeof componentOrConfig === 'function' || componentOrConfig.$$typeof) {
        config = { component: componentOrConfig };
      }
      
      const capabilities = manifest.capabilities?.[id] || {};
      const metadata = manifest.metadata?.[id] || {};
      const permissions = manifest.permissions?.[id] || {}; // Legacy fallback

      this.registerDefinition(id, {
        ...config,
        capabilities: { ...permissions, ...capabilities },
        metadata
      });
    });
  }

  /**
   * Register a single panel definition dynamically.
   * @param {string} id 
   * @param {Object} config
   */
  registerDefinition(id, config) {
    if (this.panelDefinitions.has(id)) {
      // console.warn(`RegistryService: Overwriting existing panel definition for ID '${id}'.`);
    }

    const definition = {
      id,
      component: config.component || null,
      lazyLoader: config.lazyLoader || null,
      capabilities: {
        canClose: true,
        canMove: true,
        canFloat: true,
        canResize: true,
        canPin: false,
        canDuplicate: false,
        canDetach: false,
        multiInstance: false,
        lazyLoad: !!config.lazyLoader,
        persistent: true,
        defaultVisible: true,
        ...config.capabilities
      },
      metadata: {
        title: id,
        icon: null,
        category: 'general',
        ...config.metadata
      },
      supportedModes: config.supportedModes || ['default'],
      defaultLayout: config.defaultLayout || null,
      toolbarActions: config.toolbarActions || [],
      contextMenus: config.contextMenus || [],
      keyboardShortcuts: config.keyboardShortcuts || []
    };

    this.panelDefinitions.set(id, definition);
    
    // Sync with store
    workspaceStore.addDefinition(id, definition);
    
    workspaceEventService.emit(EventCategories.PANEL.REGISTERED, { definitionId: id });
  }

  getDefinition(id) {
    return this.panelDefinitions.get(id);
  }

  hasDefinition(id) {
    return this.panelDefinitions.has(id);
  }
}

export const workspaceRegistryService = new RegistryService();
