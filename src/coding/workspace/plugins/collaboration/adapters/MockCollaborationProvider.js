import { CollaborationAdapter } from './CollaborationAdapter';

/**
 * Simulates a real-time collaboration backend.
 */
export class MockCollaborationProvider extends CollaborationAdapter {
  constructor() {
    super();
    this.connected = false;
    this.simulationTimer = null;
    this.remoteUsers = [
      { id: 'user_2', name: 'Alice (Remote)', activePanel: null },
      { id: 'user_3', name: 'Bob (Remote)', activePanel: 'console' }
    ];
  }

  async connect(sessionId, userContext) {
    this.connected = true;
    console.log(`[MockProvider] Connected to session ${sessionId} as ${userContext.name}`);
    
    // Simulate initial state sync
    setTimeout(() => {
      this.emit('session.state', { participants: this.remoteUsers });
      
      // Simulate someone joining
      setTimeout(() => {
        const newUser = { id: 'user_4', name: 'Charlie (Remote)', activePanel: null };
        this.remoteUsers.push(newUser);
        this.emit('participant.joined', newUser);
      }, 5000);
      
      // Simulate remote layout sync command
      setTimeout(() => {
        this.emit('remote.command', {
          commandId: 'openPanel',
          args: ['problems.description'],
          senderId: 'user_2'
        });
      }, 10000);
      
    }, 1000);

    return true;
  }

  async disconnect() {
    this.connected = false;
    if (this.simulationTimer) clearInterval(this.simulationTimer);
    console.log('[MockProvider] Disconnected');
    return true;
  }

  async broadcast(type, payload) {
    if (!this.connected) return;
    console.log(`[MockProvider] Broadcast ${type}:`, payload);
    // In a real provider, this goes to the websocket server.
  }
}
