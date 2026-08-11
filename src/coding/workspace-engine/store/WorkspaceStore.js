export class WorkspaceStore {
  constructor() {
    this.state = {
      session: {
        id: null,
        mode: 'default', // Active template mode
        startedAt: null
      },
      workspace: {
        id: null,
        version: 1,
        isDirty: false
      },
      layout: { // Persistent Layout State
        schema: null,
        activeLayoutId: null
      },
      definitions: {}, // { definitionId: { component, capabilities, ... } }
      instances: {}, // { instanceId: { definitionId, state, isFocused, ... } }
      windows: {
        floating: {}, // { windowId: { instanceIds: [], bounds: {} } }
        detached: {}  // { windowId: { instanceIds: [], state: {} } }
      },
      ui: {
        theme: 'dark',
        isFullscreen: false
      },
      activePanelId: null
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(updater) {
    const nextState = typeof updater === 'function' ? updater(this.state) : updater;
    // Basic shallow merge at the root, and deep merge for the root slices
    this.state = {
      session: { ...this.state.session, ...nextState.session },
      workspace: { ...this.state.workspace, ...nextState.workspace },
      layout: { ...this.state.layout, ...nextState.layout },
      definitions: { ...this.state.definitions, ...nextState.definitions },
      instances: { ...this.state.instances, ...nextState.instances },
      windows: { ...this.state.windows, ...nextState.windows },
      ui: { ...this.state.ui, ...nextState.ui },
      activePanelId: nextState.activePanelId !== undefined ? nextState.activePanelId : this.state.activePanelId
    };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // --- Specific Modifiers for Services ---

  updateSession(data) {
    this.setState(prev => ({ ...prev, session: { ...prev.session, ...data } }));
  }

  updateWorkspace(data) {
    this.setState(prev => ({ ...prev, workspace: { ...prev.workspace, ...data } }));
  }

  updateLayout(data) {
    this.setState(prev => ({ ...prev, layout: { ...prev.layout, ...data } }));
  }

  addDefinition(definitionId, definition) {
    this.setState(prev => ({
      ...prev,
      definitions: {
        ...prev.definitions,
        [definitionId]: definition
      }
    }));
  }

  addInstance(instanceId, definitionId, initialState = {}) {
    this.setState(prev => ({
      ...prev,
      instances: {
        ...prev.instances,
        [instanceId]: { definitionId, ...initialState }
      }
    }));
  }

  removeInstance(instanceId) {
    this.setState(prev => {
      const newInstances = { ...prev.instances };
      delete newInstances[instanceId];
      return { ...prev, instances: newInstances };
    });
  }

  updateInstance(instanceId, data) {
    this.setState(prev => ({
      ...prev,
      instances: {
        ...prev.instances,
        [instanceId]: { ...prev.instances[instanceId], ...data }
      }
    }));
  }

  setFocusedPanel(instanceId) {
    this.setState(prev => ({
      ...prev,
      activePanelId: instanceId
    }));
  }

  addFloatingWindow(windowId, instanceIds) {
    this.setState(prev => ({
      ...prev,
      windows: {
        ...prev.windows,
        floating: {
          ...prev.windows.floating,
          [windowId]: { instanceIds, bounds: {} }
        }
      }
    }));
  }

  removeFloatingWindow(windowId) {
    this.setState(prev => {
      const newFloating = { ...prev.windows.floating };
      delete newFloating[windowId];
      return {
        ...prev,
        windows: {
          ...prev.windows,
          floating: newFloating
        }
      };
    });
  }
}

export const workspaceStore = new WorkspaceStore();
