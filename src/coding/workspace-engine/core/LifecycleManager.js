import { workspaceManifestService } from '../services/ManifestService';
import { workspaceExtensionManager } from '../services/ExtensionManager';
import { workspaceSessionService } from '../services/SessionService';
import { workspaceEventService, EventCategories } from '../services/EventService';
import { workspaceStore } from '../store/WorkspaceStore';

class LifecycleManager {
  /**
   * Orchestrates the startup sequence of the Workspace Engine.
   */
  async boot(rawManifest) {
    try {
      workspaceEventService.emit(EventCategories.SYSTEM.BOOT_STARTED, {});

      // 1. Load Manifest
      const manifest = workspaceManifestService.load(rawManifest);
      
      // 2. Initialize Extensions
      if (manifest.extensions && manifest.extensions.length > 0) {
        await workspaceExtensionManager.initializeExtensions(manifest.extensions);
      }

      // 3. Start Session (which might apply template or default layout)
      // Note: Layout application actually delegates to Layout Adapter later, 
      // but this sets up the state intent.
      workspaceSessionService.startSession(manifest, 'default');

      workspaceEventService.emit(EventCategories.SYSTEM.BOOT_COMPLETED, {});
      
      return manifest;
    } catch (error) {
      console.error('WorkspaceEngine Lifecycle: Boot Failed', error);
      workspaceEventService.emit(EventCategories.SYSTEM.ERROR, { error, context: 'Boot' });
      throw error;
    }
  }

  shutdown() {
    workspaceSessionService.endSession();
    workspaceEventService.emit(EventCategories.SYSTEM.SHUTDOWN, {});
  }
}

export const workspaceLifecycleManager = new LifecycleManager();
