import { AIAdapter } from './AIAdapter';

export class MockAIProvider extends AIAdapter {
  async streamCompletion(messages, context, tools, onChunk, onToolCall) {
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 500));

    if (lastMessage.includes('explain workspace') || lastMessage.includes('what am i looking at')) {
      const response = `Based on your workspace context, you currently have ${context.panels?.length || 0} panels open, and your active panel is "${context.activePanel}". `;
      await this._simulateStream(response, onChunk);
    } 
    else if (lastMessage.includes('generate layout') || lastMessage.includes('reset workspace')) {
      await this._simulateStream("I can help with that. I'm going to run a command to reset your layout to the default view.", onChunk);
      
      // Simulate a tool call after speaking
      setTimeout(() => {
        onToolCall({
          tool: 'executeWorkspaceCommand',
          args: { commandId: 'layout.reset' }
        });
      }, 500);
    } 
    else {
      await this._simulateStream(`I am the Mock AI Provider. I received your message: "${messages[messages.length - 1].content}". How can I assist you with your code today?`, onChunk);
    }
  }

  async _simulateStream(text, onChunk) {
    const words = text.split(' ');
    for (const word of words) {
      onChunk(word + ' ');
      await new Promise(r => setTimeout(r, 50));
    }
  }
}
