import { workspaceCommandService } from '../services/CommandService';
import { workspaceEventService } from '../services/EventService';
import { workspaceRegistryService } from '../services/RegistryService';
import { workspaceStore } from '../store/WorkspaceStore';
import { ExtensionPlatformAPI } from './ExtensionPlatformAPI';

/**
 * Sandboxed API provided to all Workspace Engine Plugins.
 * Plugins interact with this class rather than direct engine internals.
 */
export class PluginAPI {
  constructor(extensionManifest) {
    this.extensionId = extensionManifest.id;
    this.permissions = extensionManifest.permissions || [];
    this.subscriptions = [];
  }

  // --- Panels ---

  registerPanel(id, config) {
    if (!this._hasPermission('panels')) return;
    
    // Namespace the panel ID if necessary, or just register it directly
    workspaceRegistryService.registerDefinition(id, config);
  }

  // --- Commands ---

  registerCommand(commandId, configOrHandler) {
    if (!this._hasPermission('commands')) return;
    
    // Support legacy (handler only) or metadata (object)
    let handler = configOrHandler;
    let metadata = { id: commandId, title: commandId };

    if (typeof configOrHandler === 'object') {
      handler = configOrHandler.handler;
      metadata = { ...configOrHandler, id: commandId };
    }
    
    if (handler) {
      workspaceCommandService.registerCommand(commandId, handler);
    }

    // Emit contribution for registries (Command Palette, etc.)
    this.emitEvent('system.contribution.register', {
      type: 'command',
      pluginId: this.extensionId,
      payload: metadata
    });
  }

  executeCommand(commandId, ...args) {
    return workspaceCommandService.execute(commandId, ...args);
  }

  // --- Productivity Contributions (Phase 6) ---

  registerShortcut(shortcutData) {
    if (!this._hasPermission('commands')) return;
    this.emitEvent('system.contribution.register', {
      type: 'shortcut',
      pluginId: this.extensionId,
      payload: shortcutData
    });
  }

  registerToolbarAction(actionData) {
    if (!this._hasPermission('toolbar')) return;
    this.emitEvent('system.contribution.register', {
      type: 'toolbar',
      pluginId: this.extensionId,
      payload: actionData
    });
  }

  registerContextMenu(menuData) {
    if (!this._hasPermission('menus')) return;
    this.emitEvent('system.contribution.register', {
      type: 'menu',
      pluginId: this.extensionId,
      payload: menuData
    });
  }

  registerTemplate(templateData) {
    if (!this._hasPermission('templates')) return;
    this.emitEvent('system.contribution.register', {
      type: 'template',
      pluginId: this.extensionId,
      payload: templateData
    });
  }

  // --- Events ---

  emitEvent(category, payload) {
    workspaceEventService.emit(category, payload);
  }

  subscribeEvent(category, handler) {
    const unsubscribe = workspaceEventService.on(category, handler);
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  // --- State ---

  getWorkspaceState() {
    if (!this._hasPermission('state.read')) return null;
    
    // Provide a read-only snapshot
    return Object.freeze({ ...workspaceStore.getState() });
  }
  
  subscribeState(listener) {
    if (!this._hasPermission('state.read')) return () => {};
    
    const unsubscribe = workspaceStore.subscribe(listener);
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  // --- Extension Platform ---

  getExtensionPlatform() {
    if (!this._hasPermission('extensions.manage')) {
      throw new Error(`Extension '${this.extensionId}' does not have 'extensions.manage' permission.`);
    }
    return new ExtensionPlatformAPI(this);
  }

  // --- Lifecycle Cleanup ---

  dispose() {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
    
    // Notify ecosystem that this plugin is unloading (cleans up contributions, etc.)
    this.emitEvent('system.plugin.unloaded', { pluginId: this.extensionId });
  }

  // --- Internal ---

  _hasPermission(permission) {
    if (this.permissions.includes(permission) || this.permissions.includes('*')) {
      return true;
    }
    console.warn(`[PluginAPI] Extension '${this.extensionId}' tried to access '${permission}' without permission.`);
    return false;
  }
}
