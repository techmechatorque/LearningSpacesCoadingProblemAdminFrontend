import { PluginAPI } from '../core/PluginAPI';
import { workspaceEventService, EventCategories } from './EventService';

class ExtensionRuntime {
  constructor() {
    this.loadedExtensions = new Map();
  }

  /**
   * Initializes and executes an extension within a sandboxed environment.
   */
  async loadExtension(manifest, moduleLoader) {
    if (this.loadedExtensions.has(manifest.id)) {
      console.warn(`ExtensionRuntime: Extension '${manifest.id}' is already loaded.`);
      return false;
    }

    try {
      workspaceEventService.emit(EventCategories.SYSTEM.EXTENSION_LOADING, { extensionId: manifest.id });

      // Create the sandboxed API for this specific extension
      const api = new PluginAPI(manifest);

      // Load the actual module (function or class)
      let extensionModule = moduleLoader;
      if (typeof moduleLoader === 'function' && !moduleLoader.prototype?.activate) {
         // It might be a direct async function, or a factory returning the module
         const result = await moduleLoader();
         if (result && result.activate) {
           extensionModule = result;
         } else if (typeof result === 'function') {
           extensionModule = { activate: result };
         } else {
           extensionModule = { activate: moduleLoader };
         }
      }

      if (!extensionModule || typeof extensionModule.activate !== 'function') {
        throw new Error(`Extension '${manifest.id}' does not export a valid 'activate' function.`);
      }

      // Execute the extension's activate hook
      await extensionModule.activate(api);

      this.loadedExtensions.set(manifest.id, {
        manifest,
        api,
        module: extensionModule
      });

      workspaceEventService.emit(EventCategories.SYSTEM.EXTENSION_LOADED, { extensionId: manifest.id });
      return true;

    } catch (error) {
      console.error(`ExtensionRuntime: Failed to load extension '${manifest.id}'`, error);
      workspaceEventService.emit(EventCategories.SYSTEM.ERROR, { error, context: 'ExtensionLoad' });
      return false;
    }
  }

  /**
   * Unloads an extension and cleans up its subscriptions.
   */
  async unloadExtension(extensionId) {
    const extension = this.loadedExtensions.get(extensionId);
    if (!extension) return false;

    try {
      if (typeof extension.module.deactivate === 'function') {
        await extension.module.deactivate();
      }
      
      extension.api.dispose(); // Cleans up event and state subscriptions
      this.loadedExtensions.delete(extensionId);
      
      workspaceEventService.emit(EventCategories.SYSTEM.EXTENSION_UNLOADED, { extensionId });
      return true;
    } catch (error) {
      console.error(`ExtensionRuntime: Failed to unload extension '${extensionId}'`, error);
      return false;
    }
  }

  getLoadedExtensions() {
    return Array.from(this.loadedExtensions.values()).map(ext => ext.manifest);
  }
}

export const workspaceExtensionRuntime = new ExtensionRuntime();
