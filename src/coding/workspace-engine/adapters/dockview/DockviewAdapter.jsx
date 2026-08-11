import React from 'react';
import { LayoutAdapterInterface } from '../LayoutAdapterInterface';
import { DockviewReact } from 'dockview-react';
import 'dockview-react/dist/styles/dockview.css';
import './dockview-theme.css';
import PanelRenderer from '../../core/PanelRenderer';
import { workspaceEventService, EventCategories } from '../../services/EventService';
import { workspaceStore } from '../../store/WorkspaceStore';
import { DockviewSchemaTranslator } from './DockviewSchemaTranslator';
import * as LucideIcons from 'lucide-react';

const IconTab = (props) => {
  const [title, setTitle] = React.useState(props.api?.title || 'Tab');
  
  React.useEffect(() => {
    if (!props.api) return;
    const disposable = props.api.onDidTitleChange((e) => setTitle(e.title));
    return () => disposable?.dispose();
  }, [props.api]);

  let IconComponent = null;
  try {
    const definitionId = props.params?.definitionId || props.api?.id;
    const definition = workspaceStore.getState().definitions[definitionId];
    const iconName = props.params?.icon || definition?.metadata?.icon;
    if (iconName && LucideIcons[iconName]) {
      IconComponent = LucideIcons[iconName];
    }
  } catch (e) {
    console.error('Error rendering IconTab:', e);
  }

  // Use props.api.isClosable if available, otherwise fallback to whether close() exists (or default true)
  // Some panels are marked canClose: false
  const isClosable = props.api?.isClosable;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px', height: '100%', width: '100%' }}>
      {IconComponent && <IconComponent size={14} />}
      <span style={{ fontSize: '13px', flexGrow: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{title}</span>
      
      {isClosable && (
        <div 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); props.api?.close(); }} 
          style={{ cursor: 'pointer', display: 'flex', opacity: 0.7 }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
        >
          <LucideIcons.X size={14} />
        </div>
      )}
    </div>
  );
};

// We register a single "default" component that acts as the bridge
// between Dockview and our PanelRegistry. Dockview just sees "default".
const components = {
  default: (props) => {
    // Dockview api.id is our instanceId. We pass definitionId via params.
    const instanceId = props.api.id;
    const definitionId = props.params?.definitionId || instanceId; 
    return <PanelRenderer instanceId={instanceId} definitionId={definitionId} panelProps={{ dockviewApi: props.api, params: props.params }} />;
  }
};

const tabComponents = {
  default: IconTab
};

export class DockviewAdapter extends LayoutAdapterInterface {
  constructor(engineContext) {
    super(engineContext);
    this.api = null;
    this.manifest = null;
  }

  initialize(manifest) {
    this.manifest = manifest;
  }

  onReady = (event) => {
    this.api = event.api;

    // Attach to Dockview layout events to emit Engine events
    this.api.onDidLayoutChange(() => {
      const state = DockviewSchemaTranslator.translateToEngineSchema(this.api.toJSON());
      workspaceEventService.emit(EventCategories.LAYOUT.CHANGED, { state });
    });

    this.api.onDidActivePanelChange((panel) => {
      if (panel) {
        workspaceEventService.emit(EventCategories.PANEL.FOCUSED, { instanceId: panel.id });
        workspaceStore.setFocusedPanel(panel.id);
      } else {
        workspaceEventService.emit(EventCategories.PANEL.BLURRED, {});
        workspaceStore.setFocusedPanel(null);
      }
    });

    // Translate manifest to layout if it's the first time
    if (this.manifest && this.manifest.defaultLayout) {
      DockviewSchemaTranslator.applySchemaToDockview(this.manifest.defaultLayout, this.api, this.manifest.metadata || {});
      workspaceEventService.emit(EventCategories.LAYOUT.LOADED, { source: 'manifest' });
    }
  };

  render() {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <DockviewReact
          components={components}
          tabComponents={tabComponents}
          onReady={this.onReady}
          className="dockview-theme-dark"
        />
      </div>
    );
  }

  getCommandBindings() {
    return {
      saveLayout: () => {
        if (!this.api) return null;
        return DockviewSchemaTranslator.translateToEngineSchema(this.api.toJSON());
      },
      loadLayout: (engineSchema) => {
        if (this.api && engineSchema) {
          const state = DockviewSchemaTranslator.extractDockviewState(engineSchema);
          if (state) this.api.fromJSON(state);
        }
      },
      openPanel: (definitionId, instanceId, title) => {
        if (!this.api) return;
        // Check if it already exists
        const existing = this.api.getPanel(instanceId);
        if (existing) {
          existing.api.setActive();
          return;
        }
        
        const definition = workspaceStore.getState().definitions[definitionId];
        
        // Setup initial store state for this instance
        workspaceStore.addInstance(instanceId, definitionId);
        
        this.api.addPanel({
          id: instanceId,
          component: 'default',
          tabComponent: 'default',
          title: title || definition?.metadata?.title || definitionId,
          params: { definitionId, icon: definition?.metadata?.icon }
        });
      },
      closePanel: (instanceId) => {
        const panel = this.api?.getPanel(instanceId);
        if (panel) panel.api.close();
      },
      duplicatePanel: (instanceId) => {
        if (!this.api) return;
        const existing = this.api.getPanel(instanceId);
        if (!existing) return;
        
        const definitionId = existing.params?.definitionId || instanceId;
        const newInstanceId = `${definitionId}_${Date.now()}`;
        
        workspaceStore.addInstance(newInstanceId, definitionId);
        
        this.api.addPanel({
          id: newInstanceId,
          component: 'default',
          tabComponent: 'default',
          title: existing.title,
          params: { definitionId },
          position: { referencePanel: existing, direction: 'right' }
        });
      },
      focusPanel: (instanceId) => {
        const panel = this.api?.getPanel(instanceId);
        if (panel) panel.api.setActive();
      },
      floatPanel: (instanceId) => {
        if (!this.api) return;
        const panel = this.api.getPanel(instanceId);
        if (panel) {
          // In dockview, you can popout a panel into a floating group by floating it.
          // Note: Dockview floating relies on enabling `enableFloat` on the layout component,
          // and using `panel.group.api.float()`. For phase 4, we use the Dockview popout API if available, 
          // or just standard float if configured.
          // For now, we simulate by detaching if dockview floating is set.
          if (panel.group) {
            // Dockview API for floating a group or window is group.api.float() in enterprise, 
            // but for standard Dockview React we can use addFloatingGroup.
            // Let's use standard native dockview behavior for floating if available.
            // (Assuming generic adapter mapping for now, WindowManager will emit correct events)
            console.log(`DockviewAdapter: Floating panel ${instanceId}`);
            // placeholder for specific dockview float API
          }
        }
      },
      dockPanel: (instanceId) => {
        console.log(`DockviewAdapter: Docking panel ${instanceId}`);
      },
      maximizePanel: (instanceId) => {
        const panel = this.api?.getPanel(instanceId);
        if (panel?.group) {
          panel.group.api.maximize();
        }
      },
      restorePanel: (instanceId) => {
        const panel = this.api?.getPanel(instanceId);
        if (panel?.group && panel.group.api.isMaximized()) {
          panel.group.api.exitMaximized();
        }
      }
    };
  }

  destroy() {
    this.api = null;
    this.manifest = null;
  }
}
