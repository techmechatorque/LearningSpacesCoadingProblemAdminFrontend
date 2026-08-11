/**
 * Translates between the Engine's Layout Schema and Dockview's native model.
 */
export class DockviewSchemaTranslator {
  
  /**
   * Converts the WorkspaceEngine layout schema into Dockview addPanel calls.
   * Recursively walks any tree of layout/row/column/tabset/tab nodes.
   *
   * Spatial rules:
   *  - row children are placed left-to-right (direction: 'right')
   *  - column children are placed top-to-bottom (direction: 'bottom')
   *  - tabset children share the same tab group (no direction, just referencePanel)
   *  - layout is a transparent container — just recurses into its children
   */
  static applySchemaToDockview(schema, api, metadata = {}) {
    if (!schema || schema.type !== 'layout') return;

    /**
     * Recursively walk a node. Returns the Dockview panel reference of the
     * first panel created inside this subtree (used as an anchor for siblings).
     *
     * @param {Object} node              - The schema node
     * @param {Object|null} parentRef    - A Dockview panel to position relative to
     * @param {string|null} direction    - 'right' | 'bottom' | null
     * @returns {Object|null}            - The first panel ref created in this subtree
     */
    function walkNode(node, parentRef, direction) {
      if (!node) return null;

      // --- Leaf: tab ---
      if (node.type === 'tab') {
        if (!node.component) return null;

        const config = {
          id: node.component,
          component: 'default',
          tabComponent: 'default',
          title: metadata[node.component]?.title || node.component,
          params: { definitionId: node.component, icon: metadata[node.component]?.icon }
        };

        if (parentRef && direction) {
          config.position = { referencePanel: parentRef, direction };
        } else if (parentRef) {
          config.position = { referencePanel: parentRef };
        }

        return api.addPanel(config);
      }

      // --- Tabset: children are tabs grouped together ---
      if (node.type === 'tabset') {
        let firstRef = null;
        let activeRef = null;
        for (const child of (node.children || [])) {
          if (child.type !== 'tab' || !child.component) continue;

          const config = {
            id: child.component,
            component: 'default',
            tabComponent: 'default',
            title: metadata[child.component]?.title || child.component,
            params: { definitionId: child.component, icon: metadata[child.component]?.icon }
          };

          if (firstRef) {
            // Subsequent tabs go into the same group
            config.position = { referencePanel: firstRef };
          } else if (parentRef && direction) {
            // First tab — position relative to parent
            config.position = { referencePanel: parentRef, direction };
          } else if (parentRef) {
            config.position = { referencePanel: parentRef };
          }

          const panel = api.addPanel(config);
          if (!firstRef) firstRef = panel;
          if (child.active) activeRef = panel;
        }
        
        // Dockview makes the last added panel active by default.
        // We override this to make the explicitly active or the first panel active.
        if (activeRef) {
          activeRef.api.setActive();
        } else if (firstRef) {
          firstRef.api.setActive();
        }

        return firstRef;
      }

      // --- Row / Column / Layout: structural containers ---
      if (node.type === 'row' || node.type === 'column' || node.type === 'layout') {
        // Row splits children with 'right'; Column splits with 'below'.
        // Layout is transparent — first child inherits the incoming direction.
        const splitDirection = node.type === 'row' ? 'right' : 'below';

        let prevRef = parentRef;

        for (let i = 0; i < (node.children || []).length; i++) {
          const child = node.children[i];

          let childDirection;
          if (i === 0) {
            // First child inherits the positioning context from above
            childDirection = node.type === 'layout' ? null : direction;
          } else {
            // Subsequent children split relative to the previous sibling
            childDirection = splitDirection;
          }

          const ref = walkNode(child, i === 0 ? parentRef : prevRef, childDirection);
          if (ref) prevRef = ref;
        }

        return prevRef;
      }

      return null;
    }

    walkNode(schema, null, null);
  }

  /**
   * Translates Dockview's native JSON state back into the WorkspaceEngine layout schema.
   * For Phase 2.6, we encapsulate Dockview's state within a standard Engine layout container
   * so that the Engine's PersistenceService remains agnostic.
   */
  static translateToEngineSchema(dockviewState) {
    // Ideally, we'd reverse-engineer the Dockview Grid tree back into our layout schema.
    // For now, we wrap it in an opaque layout blob so the PersistenceService is satisfied,
    // avoiding dumping raw library models directly to localStorage.
    return {
      type: 'layout',
      engineVersion: 1,
      _opaqueDockviewState: dockviewState 
    };
  }

  /**
   * Translates Engine layout container back to Dockview state.
   */
  static extractDockviewState(engineSchema) {
    if (engineSchema && engineSchema._opaqueDockviewState) {
      return engineSchema._opaqueDockviewState;
    }
    return null;
  }
}
