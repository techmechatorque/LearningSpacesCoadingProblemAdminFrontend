import { workspaceEventService, EventCategories } from './EventService';

class PersistenceService {
  /**
   * Save layout data to localStorage
   * @param {string} workspaceId - Unique ID for the workspace (e.g. from Manifest)
   * @param {Object} layoutData - The internal layout schema representation
   * @param {number} version - The version of the layout
   */
  saveLayout(workspaceId, layoutData, version) {
    if (!workspaceId) return;
    try {
      const dataToSave = {
        version,
        timestamp: Date.now(),
        layout: layoutData
      };
      localStorage.setItem(`tmt_ws_layout_${workspaceId}`, JSON.stringify(dataToSave));
      workspaceEventService.emit(EventCategories.LAYOUT.SAVED, { workspaceId, version });
    } catch (err) {
      workspaceEventService.emit(EventCategories.PERSISTENCE.SAVE_FAILED, { error: err });
    }
  }

  /**
   * Load layout data from localStorage
   * @param {string} workspaceId 
   * @param {number} currentVersion - The current expected version to check for migrations
   * @returns {Object|null}
   */
  loadLayout(workspaceId, currentVersion) {
    if (!workspaceId) return null;
    try {
      const stored = localStorage.getItem(`tmt_ws_layout_${workspaceId}`);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Basic Version checking
      if (parsed.version !== currentVersion) {
        console.warn(`PersistenceService: Version mismatch for ${workspaceId}. Expected ${currentVersion}, got ${parsed.version}. Dropping layout.`);
        return null; 
      }
      
      workspaceEventService.emit(EventCategories.LAYOUT.LOADED, { workspaceId, version: parsed.version });
      return parsed.layout;
    } catch (err) {
      workspaceEventService.emit(EventCategories.PERSISTENCE.LOAD_FAILED, { error: err });
      return null;
    }
  }

  clearLayout(workspaceId) {
    if (!workspaceId) return;
    localStorage.removeItem(`tmt_ws_layout_${workspaceId}`);
  }
}

export const workspacePersistenceService = new PersistenceService();
