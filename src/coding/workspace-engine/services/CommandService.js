import { workspaceEventService, EventCategories } from './EventService';
import { workspaceStore } from '../store/WorkspaceStore';

class CommandService {
  constructor() {
    this.adapterBindings = {};
    this.customCommands = {};
  }

  /**
   * Layout adapters register their implementation of the layout-specific commands here.
   */
  registerAdapterBindings(implementations) {
    this.adapterBindings = { ...this.adapterBindings, ...implementations };
  }

  /**
   * Plugins or external modules register custom commands here.
   */
  registerCommand(commandName, handler) {
    if (this.customCommands[commandName] || this.adapterBindings[commandName]) {
      console.warn(`CommandService: Overwriting existing command '${commandName}'.`);
    }
    this.customCommands[commandName] = handler;
  }

  /**
   * The command pipeline: Receive -> Validate -> Authorize -> Execute -> Emit -> Persist -> Update Store
   */
  execute(commandName, ...args) {
    workspaceEventService.emit(EventCategories.COMMAND.RECEIVED, { command: commandName, args });

    if (!this._validate(commandName, args)) {
      return false;
    }

    if (!this._authorize(commandName, args)) {
      return false;
    }

    const success = this._executeAdapterCommand(commandName, args);

    if (success) {
      workspaceEventService.emit(EventCategories.COMMAND.EXECUTED, { command: commandName, args });
      // The Layout Adapter or other services will handle updating the store and persisting
      // by listening to the relevant layout events (e.g. layout:changed) triggered by the adapter.
    }

    return success;
  }

  _validate(commandName, args) {
    const impl = this.adapterBindings[commandName] || this.customCommands[commandName];
    if (typeof impl !== 'function') {
      const errorMsg = `Command '${commandName}' is not supported by the current LayoutAdapter.`;
      workspaceEventService.emit(EventCategories.COMMAND.FAILED, { command: commandName, error: errorMsg });
      return false;
    }
    workspaceEventService.emit(EventCategories.COMMAND.VALIDATED, { command: commandName, args });
    return true;
  }

  _authorize(commandName, args) {
    // Phase 3: In the future, we will check the Workspace Manifest permissions here.
    // e.g., if command is 'closePanel' and manifest says canClose: false, return false.
    return true;
  }

  _executeAdapterCommand(commandName, args) {
    try {
      const impl = this.adapterBindings[commandName] || this.customCommands[commandName];
      impl(...args);
      return true;
    } catch (error) {
      workspaceEventService.emit(EventCategories.COMMAND.FAILED, { command: commandName, error });
      return false;
    }
  }

  // Stable Public API Methods

  openPanel(definitionId, instanceId = null, title = null) {
    // If instanceId is missing, generate one
    const finalInstanceId = instanceId || `${definitionId}_${Date.now()}`;
    return this.execute('openPanel', definitionId, finalInstanceId, title);
  }

  closePanel(instanceId) {
    return this.execute('closePanel', instanceId);
  }

  duplicatePanel(instanceId) {
    return this.execute('duplicatePanel', instanceId);
  }

  focusPanel(instanceId) {
    return this.execute('focusPanel', instanceId);
  }

  maximizePanel(instanceId) {
    return this.execute('maximizePanel', instanceId);
  }

  restorePanel(instanceId) {
    return this.execute('restorePanel', instanceId);
  }

  floatPanel(instanceId) {
    // We delegate floating to the WindowManager, which is a specialized service
    const { workspaceWindowManager } = require('./WindowManager');
    return workspaceWindowManager.floatPanel(instanceId);
  }

  dockPanel(instanceId) {
    const { workspaceWindowManager } = require('./WindowManager');
    return workspaceWindowManager.dockPanel(instanceId);
  }

  saveLayout() {
    // saveLayout might return data synchronously in some adapters,
    // but the pipeline usually treats execution as a side-effect.
    // If we need the layout state, the adapter should ideally sync it to the store.
    try {
      const impl = this.adapterBindings['saveLayout'];
      if (impl) return impl();
    } catch(e) {}
    return null;
  }

  loadLayout(layoutData) {
    return this.execute('loadLayout', layoutData);
  }
}

export const workspaceCommandService = new CommandService();
