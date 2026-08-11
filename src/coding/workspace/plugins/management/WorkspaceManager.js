import { LocalStorageAdapter } from './StorageAdapter';

export class WorkspaceManager {
  constructor(pluginApi) {
    this.pluginApi = pluginApi;
    this.storage = new LocalStorageAdapter('workspace_platform_');
    
    // Config
    this.debounceMs = 2000;
    this.saveTimeout = null;
    this.lastSavedLayoutStr = null;

    // Keys
    this.sessionId = this._generateSessionId();
    this.sessionKey = `session_${this.sessionId}`;
    this.presetsKey = 'user_presets';
    this.historyKey = `history_${this.sessionId}`;
  }

  _generateSessionId() {
    // In a real app, this comes from the route context (e.g., problem_123)
    return 'default_session';
  }

  // --- Auto Save & Recovery ---

  async checkForCrashRecovery() {
    const savedSession = await this.storage.load(this.sessionKey);
    return savedSession !== null ? savedSession : null;
  }

  async clearSession() {
    await this.storage.remove(this.sessionKey);
    this.lastSavedLayoutStr = null;
  }

  handleLayoutChange(layoutState) {
    const currentStr = JSON.stringify(layoutState);
    if (this.lastSavedLayoutStr === currentStr) return; // Dirty check

    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    
    this.saveTimeout = setTimeout(() => {
      this.saveSession(layoutState);
    }, this.debounceMs);
  }

  async saveSession(layoutState) {
    this.lastSavedLayoutStr = JSON.stringify(layoutState);
    await this.storage.save(this.sessionKey, {
      timestamp: Date.now(),
      layout: layoutState
    });
    this.saveSnapshot(layoutState, 'Auto Save');
  }

  // --- History / Snapshots ---

  async saveSnapshot(layoutState, actionDescription) {
    const history = await this.getHistory();
    history.push({
      id: `snap_${Date.now()}`,
      timestamp: Date.now(),
      action: actionDescription,
      layout: layoutState
    });
    
    // Keep last 20 snapshots
    if (history.length > 20) history.shift();
    
    await this.storage.save(this.historyKey, history);
    this.pluginApi.emitEvent('system.management.history_updated', history);
  }

  async getHistory() {
    return (await this.storage.load(this.historyKey)) || [];
  }

  // --- Presets ---

  async getPresets() {
    return (await this.storage.load(this.presetsKey)) || [];
  }

  async savePreset(name, layoutState) {
    const presets = await this.getPresets();
    const newPreset = {
      id: `preset_${Date.now()}`,
      name,
      timestamp: Date.now(),
      layout: layoutState
    };
    presets.push(newPreset);
    await this.storage.save(this.presetsKey, presets);
    this.pluginApi.emitEvent('system.management.presets_updated', presets);
  }

  async deletePreset(presetId) {
    let presets = await this.getPresets();
    presets = presets.filter(p => p.id !== presetId);
    await this.storage.save(this.presetsKey, presets);
    this.pluginApi.emitEvent('system.management.presets_updated', presets);
  }

  // --- Import / Export ---
  
  createExportPackage(layoutState) {
    return {
      version: '1.0.0',
      schemaVersion: 1,
      pluginVersion: '1.0.0',
      timestamp: Date.now(),
      layout: layoutState,
      metadata: {
        sessionId: this.sessionId
      }
    };
  }

  validateImportPackage(pkg) {
    if (!pkg || typeof pkg !== 'object') throw new Error('Invalid package format');
    if (pkg.version !== '1.0.0') throw new Error('Unsupported workspace version');
    if (!pkg.layout) throw new Error('Package missing layout data');
    return true;
  }
}
