import React, { Suspense, useMemo } from 'react';
import { workspaceRegistryService } from '../services/RegistryService';
import { workspaceEventService, EventCategories } from '../services/EventService';
import { workspaceStore } from '../store/WorkspaceStore';

/**
 * A highly generic boundary wrapper that renders a registered panel.
 * The underlying layout adapter (e.g. Dockview/flexlayout) should use this component
 * to render the content inside its tabs, preventing the library from ever
 * needing to know about our business components.
 */
const PanelRenderer = ({ instanceId, definitionId, panelProps = {} }) => {
  const definition = workspaceRegistryService.getDefinition(definitionId);

  // Resolve the component: either a direct component reference, or a lazy-loaded one.
  const Component = useMemo(() => {
    if (!definition) return null;
    if (definition.component) return definition.component;
    if (definition.lazyLoader) return React.lazy(definition.lazyLoader);
    return null;
  }, [definition]);

  React.useEffect(() => {
    // Fire lifecycle hooks managed by the engine
    workspaceEventService.emit(EventCategories.PANEL.MOUNTED, { instanceId, definitionId });
    workspaceStore.updateInstance(instanceId, { mounted: true });
    
    return () => {
      workspaceEventService.emit(EventCategories.PANEL.UNMOUNTED, { instanceId, definitionId });
      workspaceStore.updateInstance(instanceId, { mounted: false });
    };
  }, [instanceId, definitionId]);

  if (!definition) {
    console.error(`PanelRenderer: Attempted to render unregistered definition '${definitionId}' for instance '${instanceId}'`);
    return (
      <div className="workspace-engine-error-panel">
        <p>Error: Panel Definition '{definitionId}' is not registered.</p>
      </div>
    );
  }

  if (!Component) {
    return <div className="workspace-engine-error-panel">No component or lazyLoader for '{definitionId}'</div>;
  }

  return (
    <div className="workspace-engine-panel-content">
      <Suspense fallback={<div className="workspace-engine-loading">Loading {definitionId}...</div>}>
        <Component instanceId={instanceId} {...panelProps} />
      </Suspense>
    </div>
  );
};

export default PanelRenderer;

