export class ToolManager {
  constructor() {
    this.tools = new Map();
  }

  registerTool(name, schema) {
    this.tools.set(name, schema);
  }

  getTools() {
    return Array.from(this.tools.values());
  }
}
