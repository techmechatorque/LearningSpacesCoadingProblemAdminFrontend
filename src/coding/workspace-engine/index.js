export { WorkspaceEngineProvider, useWorkspaceEngine } from './core/WorkspaceEngineContext';
export { workspaceCommandService as WorkspaceCommands } from './services/CommandService';
export { workspaceEventService as WorkspaceEvents, EventCategories } from './services/EventService';
export { workspaceManifestService as ManifestLoader } from './services/ManifestService';
export { workspacePersistenceService as PersistenceService } from './services/PersistenceService';
export { workspaceRegistryService as RegistryService } from './services/RegistryService';
export { workspaceErrorService as ErrorService } from './services/ErrorService';
export { workspaceWindowManager as WindowManager } from './services/WindowManager';
export { workspaceExtensionManager as ExtensionManager } from './services/ExtensionManager';
export { workspaceSessionService as SessionService } from './services/SessionService';
export { workspaceLifecycleManager as LifecycleManager } from './core/LifecycleManager';
export { workspaceStore as WorkspaceStore } from './store/WorkspaceStore';

export { LayoutAdapterInterface } from './adapters/LayoutAdapterInterface';
export { default as PanelRenderer } from './core/PanelRenderer';
export { LayoutSchemaDefinition } from './schema/LayoutSchema';
export { validateManifest, ManifestValidationError } from './schema/ManifestValidator';

export { WorkspaceEngine } from './core/WorkspaceEngine';
export { WorkspaceErrorBoundary } from './components/WorkspaceErrorBoundary';
