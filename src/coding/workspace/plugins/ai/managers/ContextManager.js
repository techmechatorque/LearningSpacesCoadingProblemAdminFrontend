export class ContextManager {
  constructor(pluginApi) {
    this.pluginApi = pluginApi;
  }

  /**
   * Retrieves the current workspace context safely filtered for the AI.
   */
  getWorkspaceContext() {
    const state = this.pluginApi.getWorkspaceState();
    if (!state) return {};
    
    return {
      activePanel: state.activePanel,
      panels: state.panels ? state.panels.map(p => p.id) : [],
      // Future: add open files, selected text, etc.
    };
  }
}
