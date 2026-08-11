export class ConversationManager {
  constructor() {
    this.messages = [];
  }

  addMessage(role, content) {
    const msg = { id: Date.now().toString() + Math.random(), role, content };
    this.messages.push(msg);
    return msg;
  }

  getMessages() {
    return this.messages;
  }

  clear() {
    this.messages = [];
  }
}
