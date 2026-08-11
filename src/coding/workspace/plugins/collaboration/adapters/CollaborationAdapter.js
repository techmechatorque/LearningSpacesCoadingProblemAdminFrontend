/**
 * The base interface for any collaboration transport layer (WebSocket, Yjs, Supabase, etc).
 */
export class CollaborationAdapter {
  constructor() {
    this.listeners = new Map();
  }

  async connect(sessionId, userContext) {
    throw new Error('Not implemented');
  }

  async disconnect() {
    throw new Error('Not implemented');
  }

  async broadcast(type, payload) {
    throw new Error('Not implemented');
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    return () => this.listeners.get(eventType).delete(callback);
  }

  emit(eventType, payload) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(cb => cb(payload));
    }
  }
}
