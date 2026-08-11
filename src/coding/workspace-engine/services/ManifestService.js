import { validateManifest } from '../schema/ManifestValidator';
import { workspaceRegistryService } from './RegistryService';
import { workspaceStore } from '../store/WorkspaceStore';

class ManifestService {
  /**
   * Loads a manifest into the workspace engine.
   * Validates it, registers panels, and extracts the layout.
   * Treats the manifest as an immutable source of truth for the workspace definition.
   * @param {Object} rawManifest 
   * @returns {Object} Validated, frozen manifest
   */
  load(rawManifest) {
    // 1. Validate (throws if invalid)
    validateManifest(rawManifest);

    // 2. Deep freeze to ensure immutability
    const manifest = this._deepFreeze({ ...rawManifest });

    // 3. Register Panel Definitions
    workspaceRegistryService.registerFromManifest(manifest);

    // 4. Update the Workspace Store with the manifest definition
    workspaceStore.updateWorkspace({
      id: manifest.id,
      version: manifest.version || 1,
      minEngineVersion: manifest.minEngineVersion || 1,
      modes: manifest.modes || ['default']
    });

    if (manifest.defaultLayout) {
      workspaceStore.updateLayout({ schema: manifest.defaultLayout });
    }

    return manifest;
  }

  _deepFreeze(object) {
    const propNames = Object.getOwnPropertyNames(object);
    for (const name of propNames) {
      if (name === 'moduleLoader' || name === 'component' || name === 'lazyLoader') continue;
      const value = object[name];
      if (value && typeof value === "object" && !Object.isFrozen(value)) {
        this._deepFreeze(value);
      }
    }
    return Object.freeze(object);
  }
}

export const workspaceManifestService = new ManifestService();
