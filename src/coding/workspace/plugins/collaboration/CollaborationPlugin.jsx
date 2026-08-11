import React from 'react';
import { MockCollaborationProvider } from './adapters/MockCollaborationProvider';
import { SessionManager } from './managers/SessionManager';
import { PresenceManager } from './managers/PresenceManager';
import { SyncManager } from './managers/SyncManager';
import { DiscussionsPanel } from './components/DiscussionsPanel';
import { PresenceIndicators } from './components/CollaborationUI';

export async function activate(pluginApi) {
  console.log('[CollaborationPlugin] Activating Collaboration Framework...');

  // 1. Initialize Transport Adapter
  const adapter = new MockCollaborationProvider();

  // 2. Initialize Managers
  const sessionManager = new SessionManager(adapter, pluginApi);
  const presenceManager = new PresenceManager(adapter, pluginApi);
  const syncManager = new SyncManager(adapter, pluginApi);

  // 3. Register Panels
  pluginApi.registerPanel('collaboration.discussions', {
    component: () => <DiscussionsPanel pluginApi={pluginApi} />,
    capabilities: { multiInstance: false, canFloat: true, canClose: true },
    metadata: { title: 'Discussions', category: 'collaboration' }
  });

  pluginApi.registerPanel('collaboration.presence', {
    component: () => <PresenceIndicators pluginApi={pluginApi} />,
    capabilities: { multiInstance: false, canFloat: true, canClose: true },
    metadata: { title: 'Collaborators', category: 'collaboration' }
  });

  // 4. Register Commands
  pluginApi.registerCommand('collaboration.start', {
    title: 'Start Collaboration Session',
    category: 'Collaboration',
    handler: () => sessionManager.startSession()
  });

  pluginApi.registerCommand('collaboration.disconnect', {
    title: 'Disconnect Session',
    category: 'Collaboration',
    handler: () => sessionManager.disconnect()
  });

  pluginApi.registerCommand('collaboration.followUser', {
    title: 'Follow User',
    category: 'Collaboration',
    handler: () => {
      const users = presenceManager.getParticipants();
      if (users.length > 0) {
        syncManager.followUser(users[0].id); // Just follow the first one for POC
        pluginApi.emitEvent('system.notification', { type: 'info', message: `Following ${users[0].name}` });
      } else {
        pluginApi.emitEvent('system.notification', { type: 'warning', message: `No active users to follow.` });
      }
    }
  });

  pluginApi.registerCommand('collaboration.openDiscussions', {
    title: 'Open Discussions',
    category: 'Collaboration',
    handler: () => pluginApi.executeCommand('openPanel', 'collaboration.discussions')
  });

  // 5. Register Toolbar Actions
  pluginApi.registerToolbarAction({
    id: 'toolbar.collab.start',
    title: 'Start Collab',
    command: 'collaboration.start'
  });

  pluginApi.registerToolbarAction({
    id: 'toolbar.collab.follow',
    title: 'Follow User',
    command: 'collaboration.followUser'
  });

  pluginApi.registerToolbarAction({
    id: 'toolbar.collab.chat',
    title: 'Chat',
    command: 'collaboration.openDiscussions'
  });

  pluginApi.registerToolbarAction({
    id: 'toolbar.collab.presence',
    title: 'Presence',
    command: 'openPanel',
    args: ['collaboration.presence'] // Normally we'd want this inline, but a panel is fine for POC
  });

  // Auto-start a session for demo purposes, or wait for user to click "Start Collab".
};
