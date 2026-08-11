import { workspaceErrorService } from './ErrorService';

class EventService {
  constructor() {
    this.listeners = {};
  }

  /**
   * Subscribe to an event.
   * @param {string} event - The event name.
   * @param {Function} callback - The callback to execute.
   * @returns {Function} Unsubscribe function.
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Emit an event.
   * @param {string} event - The event name.
   * @param {any} data - Data to pass to callbacks.
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          workspaceErrorService.logError('EventService', error, { event, data });
        }
      });
    }
  }

  /**
   * Clear all listeners for a specific event.
   * @param {string} event 
   */
  clear(event) {
    if (this.listeners[event]) {
      delete this.listeners[event];
    }
  }
}

// Global singleton instance for the workspace engine
export const workspaceEventService = new EventService();

export const EventCategories = {
  WORKSPACE: {
    MOUNTED: 'workspace:mounted',
    UNMOUNTED: 'workspace:unmounted',
    CHANGED: 'workspace:changed',
  },
  PANEL: {
    REGISTERED: 'panel:registered',
    MOUNTED: 'panel:mounted',
    UNMOUNTED: 'panel:unmounted',
    FOCUSED: 'panel:focused',
    BLURRED: 'panel:blurred',
    MOVED: 'panel:moved',
  },
  LAYOUT: {
    LOADED: 'layout:loaded',
    SAVED: 'layout:saved',
    CHANGED: 'layout:changed',
    RESIZED: 'layout:resized',
  },
  COMMAND: {
    RECEIVED: 'command:received',
    VALIDATED: 'command:validated',
    EXECUTED: 'command:executed',
    FAILED: 'command:failed',
  },
  PERSISTENCE: {
    LOAD_FAILED: 'persistence:load_failed',
    SAVE_FAILED: 'persistence:save_failed',
  },
  SYSTEM: {
    ERROR: 'system:error',
    BOOT_STARTED: 'system:boot_started',
    BOOT_COMPLETED: 'system:boot_completed',
    SHUTDOWN: 'system:shutdown',
    SESSION_STARTED: 'system:session_started',
    SESSION_ENDED: 'system:session_ended',
    EXTENSION_LOADING: 'system:extension_loading',
    EXTENSION_LOADED: 'system:extension_loaded',
    EXTENSION_UNLOADED: 'system:extension_unloaded'
  }
};
