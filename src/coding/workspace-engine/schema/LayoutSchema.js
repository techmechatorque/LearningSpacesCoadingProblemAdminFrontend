/**
 * Defines the Workspace Engine's internal, library-agnostic layout schema.
 * The layout adapter is responsible for translating this into the chosen library's specific format.
 */

export const LayoutSchemaDefinition = {
  version: 1,
  
  /**
   * Root wrapper of the layout tree.
   * Type can be 'row' or 'column'
   */
  type: 'layout',

  /**
   * Allowed node types in the layout engine.
   */
  NodeTypes: {
    ROW: 'row',
    COLUMN: 'column',
    TABSET: 'tabset',
    TAB: 'tab',
  },

  /**
   * Standardizes the expected format of a Node.
   * Layout adapters should parse this structure.
   */
  NodeTemplate: {
    type: 'string', // 'row', 'column', 'tabset', 'tab'
    id: 'string', // optional identifier
    weight: 'number', // flex ratio weight
    active: 'boolean', // for tabsets: which tab is active, for tabs: is this tab active
    component: 'string', // panel ID reference (only valid on 'tab' nodes)
    children: 'array', // array of child NodeTemplates
  }
};
