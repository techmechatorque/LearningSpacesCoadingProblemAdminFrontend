export class SessionManager {
  constructor(adapter, pluginApi) {
    this.adapter = adapter;
    this.pluginApi = pluginApi;
    this.currentSessionId = null;
    this.localUserContext = { id: 'local_user', name: 'You (Local)' };
  }

  async startSession() {
    this.currentSessionId = `collab_${Math.random().toString(36).substr(2, 9)}`;
    const success = await this.adapter.connect(this.currentSessionId, this.localUserContext);
    if (success) {
      this.pluginApi.emitEvent('system.notification', { type: 'success', message: `Collaboration session ${this.currentSessionId} started.` });
    }
  }

  async joinSession(sessionId) {
    this.currentSessionId = sessionId;
    const success = await this.adapter.connect(this.currentSessionId, this.localUserContext);
    if (success) {
      this.pluginApi.emitEvent('system.notification', { type: 'success', message: `Joined session ${this.currentSessionId}.` });
    }
  }

  async disconnect() {
    await this.adapter.disconnect();
    this.currentSessionId = null;
    this.pluginApi.emitEvent('system.notification', { type: 'info', message: 'Disconnected from collaboration session.' });
  }

  getSessionId() {
    return this.currentSessionId;
  }
}
