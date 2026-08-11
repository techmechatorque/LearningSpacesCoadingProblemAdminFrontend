import { workspaceEventService, EventCategories } from './EventService';
import { workspaceStore } from '../store/WorkspaceStore';

class WindowManager {
  constructor() {
    this.adapterBindings = {};
  }

  /**
   * Layout adapters register their implementation of window operations here.
   */
  registerAdapterBindings(implementations) {
    this.adapterBindings = { ...this.adapterBindings, ...implementations };
  }

  /**
   * Floats an existing panel out of the main dock into a popout window.
   */
  floatPanel(instanceId) {
    if (!this.adapterBindings.floatPanel) return false;
    
    // Authorization: Check if panel has canFloat capability
    const instance = workspaceStore.getState().instances[instanceId];
    if (!instance) return false;
    
    const definition = workspaceStore.getState().definitions[instance.definitionId];
    if (!definition || !definition.capabilities.canFloat) {
      console.warn(`WindowManager: Panel instance ${instanceId} does not have capability 'canFloat'`);
      return false;
    }

    try {
      this.adapterBindings.floatPanel(instanceId);
      workspaceEventService.emit(EventCategories.PANEL.MOVED, { instanceId, target: 'floating' });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Docks a floating panel back into the main workspace.
   */
  dockPanel(instanceId) {
    if (!this.adapterBindings.dockPanel) return false;
    try {
      this.adapterBindings.dockPanel(instanceId);
      workspaceEventService.emit(EventCategories.PANEL.MOVED, { instanceId, target: 'docked' });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

export const workspaceWindowManager = new WindowManager();
