export class CommandRegistry {
  constructor() { this.commands = new Map(); }
  register(pluginId, metadata) {
    this.commands.set(metadata.id, { ...metadata, pluginId });
  }
  unregisterByPluginId(pluginId) {
    for (const [key, val] of this.commands.entries()) {
      if (val.pluginId === pluginId) this.commands.delete(key);
    }
  }
  getAll() { return Array.from(this.commands.values()); }
}

export class ShortcutRegistry {
  constructor() { this.shortcuts = new Map(); }
  register(pluginId, metadata) {
    // metadata: { keybinding, commandId, context }
    this.shortcuts.set(metadata.keybinding, { ...metadata, pluginId });
  }
  match(event) {
    // simplistic matcher for demonstration
    const keyParts = [];
    if (event.ctrlKey) keyParts.push('Ctrl');
    if (event.shiftKey) keyParts.push('Shift');
    if (event.altKey) keyParts.push('Alt');
    if (event.metaKey) keyParts.push('Meta');
    
    // Ignore pure modifier keys
    if (!['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) {
      keyParts.push(event.key.length === 1 ? event.key.toUpperCase() : event.key);
    }
    
    const keybinding = keyParts.join('+');
    return this.shortcuts.get(keybinding);
  }
  unregisterByPluginId(pluginId) {
    for (const [key, val] of this.shortcuts.entries()) {
      if (val.pluginId === pluginId) this.shortcuts.delete(key);
    }
  }
  getAll() { return Array.from(this.shortcuts.values()); }
}

export class ToolbarRegistry {
  constructor() { this.actions = new Map(); }
  register(pluginId, metadata) {
    this.actions.set(metadata.id, { ...metadata, pluginId });
  }
  unregisterByPluginId(pluginId) {
    for (const [key, val] of this.actions.entries()) {
      if (val.pluginId === pluginId) this.actions.delete(key);
    }
  }
  getAll() { return Array.from(this.actions.values()); }
}

export class MenuRegistry {
  constructor() { this.menus = new Map(); }
  register(pluginId, metadata) {
    this.menus.set(metadata.id, { ...metadata, pluginId });
  }
  unregisterByPluginId(pluginId) {
    for (const [key, val] of this.menus.entries()) {
      if (val.pluginId === pluginId) this.menus.delete(key);
    }
  }
  getAll() { return Array.from(this.menus.values()); }
}

export class TemplateRegistry {
  constructor() { this.templates = new Map(); }
  register(pluginId, metadata) {
    this.templates.set(metadata.id, { ...metadata, pluginId });
  }
  unregisterByPluginId(pluginId) {
    for (const [key, val] of this.templates.entries()) {
      if (val.pluginId === pluginId) this.templates.delete(key);
    }
  }
  getAll() { return Array.from(this.templates.values()); }
}
