import { workspaceExtensionRuntime } from './ExtensionRuntime';

class ExtensionManager {
  /**
   * Discovers and registers extensions from the manifest or external sources.
   */
  async initializeExtensions(manifests) {
    if (!manifests || !Array.isArray(manifests)) return;
    
    for (const extensionManifest of manifests) {
      // In a real plugin system, this might use a module loader to fetch from a URL
      // For Phase 5, we expect the manifest to provide the `moduleLoader` inline or we dynamically import it.
      if (extensionManifest.moduleLoader) {
        await workspaceExtensionRuntime.loadExtension(extensionManifest, extensionManifest.moduleLoader);
      } else {
        console.warn(`ExtensionManager: Extension '${extensionManifest.id}' has no moduleLoader provided.`);
      }
    }
  }

  getLoadedExtensions() {
    return workspaceExtensionRuntime.getLoadedExtensions();
  }
}

export const workspaceExtensionManager = new ExtensionManager();
