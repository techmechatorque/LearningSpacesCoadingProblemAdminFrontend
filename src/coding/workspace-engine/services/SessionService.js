import { workspaceStore } from '../store/WorkspaceStore';
import { workspaceEventService, EventCategories } from './EventService';
import { workspaceCommandService } from './CommandService';

class SessionService {
  /**
   * Initializes a new workspace session, optionally applying a template.
   */
  startSession(manifest, templateId = 'default') {
    const sessionId = `session_${Date.now()}`;
    
    workspaceStore.updateSession({
      id: sessionId,
      mode: templateId,
      startedAt: Date.now()
    });

    workspaceEventService.emit(EventCategories.SYSTEM.SESSION_STARTED, { sessionId, mode: templateId });

    // Apply template layout if specified in manifest, else fallback to default layout
    const templateLayout = manifest.templates?.[templateId]?.layout || manifest.defaultLayout;
    
    if (templateLayout) {
      workspaceCommandService.loadLayout(templateLayout);
    }
  }

  /**
   * Ends the current session, clearing runtime state but leaving persistent layout untouched.
   */
  endSession() {
    const sessionId = workspaceStore.getState().session.id;
    if (!sessionId) return;
    
    // Clear runtime instances
    workspaceStore.setState(prev => ({
      ...prev,
      session: { id: null, mode: 'default', startedAt: null },
      instances: {},
      windows: { floating: {}, detached: {} },
      activePanelId: null
    }));

    workspaceEventService.emit(EventCategories.SYSTEM.SESSION_ENDED, { sessionId });
  }
}

export const workspaceSessionService = new SessionService();
