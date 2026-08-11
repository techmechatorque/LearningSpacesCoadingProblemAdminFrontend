export class ActionManager {
  constructor(pluginApi) {
    this.pluginApi = pluginApi;
  }

  handleToolCall(toolCall) {
    if (toolCall.tool === 'executeWorkspaceCommand') {
      const { commandId, args } = toolCall.args;
      
      // In a real implementation, you might prompt the user for confirmation here.
      console.log(`[ActionManager] AI executing workspace command: ${commandId}`);
      
      this.pluginApi.emitEvent('system.notification', { type: 'info', message: `AI Executing: ${commandId}` });
      
      // We pass the args as array if they exist, or just call it directly
      if (args && Array.isArray(args)) {
        this.pluginApi.executeCommand(commandId, ...args);
      } else {
        this.pluginApi.executeCommand(commandId);
      }
    }
  }
}
