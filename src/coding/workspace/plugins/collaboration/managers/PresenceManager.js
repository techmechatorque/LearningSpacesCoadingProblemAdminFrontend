export class PresenceManager {
  constructor(adapter, pluginApi) {
    this.adapter = adapter;
    this.pluginApi = pluginApi;
    this.participants = new Map(); // id -> user object
    
    // Subscribe to incoming presence updates
    this.adapter.on('participant.joined', this.handleJoin.bind(this));
    this.adapter.on('participant.left', this.handleLeave.bind(this));
    this.adapter.on('session.state', this.handleState.bind(this));
    this.adapter.on('participant.activity', this.handleActivity.bind(this));
  }

  handleState(state) {
    state.participants.forEach(p => this.participants.set(p.id, p));
    this.notifyUI();
  }

  handleJoin(user) {
    this.participants.set(user.id, user);
    this.pluginApi.emitEvent('system.notification', { type: 'info', message: `${user.name} joined the session.` });
    this.notifyUI();
  }

  handleLeave(userId) {
    const user = this.participants.get(userId);
    if (user) {
      this.pluginApi.emitEvent('system.notification', { type: 'info', message: `${user.name} left.` });
      this.participants.delete(userId);
      this.notifyUI();
    }
  }

  handleActivity({ userId, panelId }) {
    const user = this.participants.get(userId);
    if (user) {
      user.activePanel = panelId;
      this.notifyUI();
    }
  }

  notifyUI() {
    this.pluginApi.emitEvent('collaboration.presence.updated', Array.from(this.participants.values()));
  }

  getParticipants() {
    return Array.from(this.participants.values());
  }
}
