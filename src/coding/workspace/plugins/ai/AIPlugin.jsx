import React from 'react';
import { ProviderManager } from './managers/ProviderManager';
import { ContextManager } from './managers/ContextManager';
import { PromptManager } from './managers/PromptManager';
import { ConversationManager } from './managers/ConversationManager';
import { ActionManager } from './managers/ActionManager';
import { ToolManager } from './managers/ToolManager';
import { AIChatPanel } from './components/AIChatPanel';

export async function activate(pluginApi) {
  console.log('[AIPlugin] Activating AI Platform Framework...');

  // 1. Initialize Managers
  const providerManager = new ProviderManager();
  const contextManager = new ContextManager(pluginApi);
  const promptManager = new PromptManager();
  const conversationManager = new ConversationManager();
  const actionManager = new ActionManager(pluginApi);
  const toolManager = new ToolManager();

  // 2. Register Built-in Tools
  toolManager.registerTool('executeWorkspaceCommand', {
    description: 'Executes a registered Workspace Command by its ID.',
    parameters: {
      commandId: 'string',
      args: 'array'
    }
  });

  // 3. Register AI Assistant Panel
  pluginApi.registerPanel('ai.assistant', {
    component: () => (
      <AIChatPanel 
        pluginApi={pluginApi}
        providerManager={providerManager}
        contextManager={contextManager}
        promptManager={promptManager}
        conversationManager={conversationManager}
        actionManager={actionManager}
        toolManager={toolManager}
      />
    ),
    capabilities: { multiInstance: false, canFloat: true, canClose: true },
    metadata: { title: 'AI Assistant', category: 'ai' }
  });

  // 4. Register Commands
  pluginApi.registerCommand('ai.openAssistant', {
    title: 'Open AI Assistant',
    category: 'AI Workspace',
    handler: () => pluginApi.executeCommand('openPanel', 'ai.assistant')
  });

  pluginApi.registerCommand('ai.explainWorkspace', {
    title: 'Explain Workspace',
    category: 'AI Workspace',
    handler: () => {
      pluginApi.executeCommand('openPanel', 'ai.assistant');
      // Simulate sending a message to the AI programmatically
      setTimeout(() => {
        // Because the AIChatPanel manages its own state by pulling from conversationManager,
        // we can push a message directly, but we need a way to trigger the generation.
        // For POC, we'll just open the panel, user can type it.
        pluginApi.emitEvent('system.notification', { type: 'info', message: 'Type "explain workspace" in the AI Assistant.' });
      }, 500);
    }
  });

  // 5. Register Toolbar Actions
  pluginApi.registerToolbarAction({
    id: 'toolbar.ai.assistant',
    title: 'AI Assistant',
    command: 'ai.openAssistant'
  });

  pluginApi.registerToolbarAction({
    id: 'toolbar.ai.explain',
    title: 'Explain Workspace',
    command: 'ai.explainWorkspace'
  });
};
