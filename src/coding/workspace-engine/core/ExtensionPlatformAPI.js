import { workspaceExtensionRuntime } from '../services/ExtensionRuntime';

/**
 * Provides a controlled, sandboxed public API to the Extension Runtime.
 * Only accessible to plugins with 'extensions.manage' permission.
 */
export class ExtensionPlatformAPI {
  constructor(pluginApi) {
    this.pluginApi = pluginApi;
  }

  /**
   * Returns a list of all currently loaded extension manifests.
   */
  getLoadedExtensions() {
    return workspaceExtensionRuntime.getLoadedExtensions();
  }

  /**
   * Installs and loads an extension dynamically.
   * @param {Object} manifest The extension manifest.
   * @param {Object|Function} moduleLoader The extension module or async loader.
   */
  async loadExtension(manifest, moduleLoader) {
    return await workspaceExtensionRuntime.loadExtension(manifest, moduleLoader);
  }

  /**
   * Unloads an extension and cleans up its resources and contributions.
   * @param {string} extensionId The ID of the extension to unload.
   */
  async unloadExtension(extensionId) {
    // Prevent plugins from unloading themselves or core ecosystem plugins
    if (extensionId === this.pluginApi.extensionId) {
      throw new Error(`Extension '${extensionId}' cannot unload itself.`);
    }
    if (extensionId.startsWith('system.')) {
      throw new Error(`Cannot unload system extension '${extensionId}'.`);
    }

    return await workspaceExtensionRuntime.unloadExtension(extensionId);
  }
}
