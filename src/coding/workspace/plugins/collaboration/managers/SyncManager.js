export class SyncManager {
  constructor(adapter, pluginApi) {
    this.adapter = adapter;
    this.pluginApi = pluginApi;
    this.followingUserId = null;

    // Listen to local layout changes and broadcast
    this.pluginApi.subscribeEvent('layout.changed', (state) => {
      this.adapter.broadcast('layout.changed', state);
    });

    // Listen for remote commands
    this.adapter.on('remote.command', this.handleRemoteCommand.bind(this));
  }

  handleRemoteCommand({ commandId, args, senderId }) {
    // If we are explicitly following this user, auto-apply the command.
    // Otherwise, maybe prompt or just log it.
    if (this.followingUserId === senderId) {
      console.log(`[SyncManager] Auto-applying remote command from ${senderId}: ${commandId}`);
      this.pluginApi.executeCommand(commandId, ...args);
    } else {
      console.log(`[SyncManager] Remote command from ${senderId} ignored (not following). command: ${commandId}`);
      // In a real app, might show a toast "User X opened panel Y, [Click to View]"
    }
  }

  followUser(userId) {
    this.followingUserId = userId;
    console.log(`[SyncManager] Now following user ${userId}`);
    this.adapter.broadcast('participant.following', { targetId: userId });
  }

  stopFollowing() {
    this.followingUserId = null;
    console.log(`[SyncManager] Stopped following`);
  }
}
