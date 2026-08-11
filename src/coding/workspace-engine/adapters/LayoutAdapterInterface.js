/**
 * LayoutAdapterInterface
 * 
 * Defines the contract that every layout library adapter (Dockview, flexlayout-react, rc-dock)
 * must implement to plug into the Workspace Engine.
 * 
 * The Engine uses this interface to interact with the underlying layout library
 * without knowing its specific API.
 */
export class LayoutAdapterInterface {
  constructor(engineContext) {
    if (new.target === LayoutAdapterInterface) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
    this.engineContext = engineContext;
  }

  /**
   * Initializes the layout library using the validated WorkspaceManifest.
   * @param {Object} manifest The application's workspace manifest
   */
  initialize(manifest) {
    throw new Error("Method 'initialize(manifest)' must be implemented.");
  }

  /**
   * Renders the React component that visually hosts the layout library.
   * @returns {React.ReactNode}
   */
  render() {
    throw new Error("Method 'render()' must be implemented.");
  }

  /**
   * Returns a map of standard Workspace Commands implemented using the library's internal APIs.
   * This is consumed by the CommandManager.
   * @returns {Object} Map of command functions (openPanel, closePanel, etc.)
   */
  getCommandBindings() {
    throw new Error("Method 'getCommandBindings()' must be implemented.");
  }

  /**
   * Cleans up listeners and DOM elements before unmounting.
   */
  destroy() {
    throw new Error("Method 'destroy()' must be implemented.");
  }
}
