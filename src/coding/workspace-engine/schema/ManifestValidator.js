import { LayoutSchemaDefinition } from './LayoutSchema';

export class ManifestValidationError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'ManifestValidationError';
    this.context = context;
  }
}

export const validateManifest = (manifest) => {
  if (!manifest) {
    throw new ManifestValidationError('Manifest is undefined or null.');
  }

  if (!manifest.id) {
    throw new ManifestValidationError('Manifest must have a unique "id".');
  }

  if (!manifest.panels || typeof manifest.panels !== 'object') {
    throw new ManifestValidationError('Manifest must define a "panels" registry object.');
  }

  const panelIds = Object.keys(manifest.panels);
  if (panelIds.length === 0) {
    throw new ManifestValidationError('Manifest "panels" registry cannot be empty.');
  }

  // Ensure default layout exists
  if (!manifest.defaultLayout || typeof manifest.defaultLayout !== 'object') {
    throw new ManifestValidationError('Manifest must define a "defaultLayout" object.');
  }

  // Recursively validate layout nodes and component references
  const validateNode = (node, path) => {
    if (!node.type) {
      throw new ManifestValidationError(`Node missing "type" at ${path}`);
    }

    const validTypes = Object.values(LayoutSchemaDefinition.NodeTypes);
    // Root type is 'layout', others follow NodeTypes
    if (node.type !== 'layout' && !validTypes.includes(node.type)) {
      throw new ManifestValidationError(`Invalid node type "${node.type}" at ${path}. Allowed types: ${validTypes.join(', ')}`);
    }

    if (node.type === LayoutSchemaDefinition.NodeTypes.TAB) {
      if (!node.component) {
        throw new ManifestValidationError(`Tab node missing "component" reference at ${path}`);
      }
      if (!manifest.panels[node.component]) {
        // If the component contains a dot (e.g. productivity.toolbar), it's likely provided by a plugin at runtime.
        if (!node.component.includes('.')) {
          console.warn(`ManifestWarning: Tab node references component "${node.component}" which is not in static panels. Assuming it will be provided by an extension.`);
        }
      }
    }

    if (node.children) {
      if (!Array.isArray(node.children)) {
        throw new ManifestValidationError(`"children" must be an array at ${path}`);
      }
      node.children.forEach((child, index) => {
        validateNode(child, `${path}.children[${index}]`);
      });
    }
  };

  validateNode(manifest.defaultLayout, 'defaultLayout');

  // Validate Permissions match registered panels
  if (manifest.permissions) {
    Object.keys(manifest.permissions).forEach(key => {
      if (!manifest.panels[key]) {
        console.warn(`ManifestWarning: Permission defined for unregistered panel "${key}" in manifest "${manifest.id}".`);
      }
    });
  }

  return true;
};
