export class ContributionRegistry {
  constructor(registries) {
    this.registries = registries; // { command, shortcut, toolbar, menu, template }
    this.contributions = [];
  }

  handleContribution(event) {
    const { type, pluginId, payload } = event;
    this.contributions.push(event);

    switch (type) {
      case 'command':
        this.registries.command.register(pluginId, payload);
        break;
      case 'shortcut':
        this.registries.shortcut.register(pluginId, payload);
        break;
      case 'toolbar':
        this.registries.toolbar.register(pluginId, payload);
        break;
      case 'menu':
        this.registries.menu.register(pluginId, payload);
        break;
      case 'template':
        this.registries.template.register(pluginId, payload);
        break;
      default:
        console.warn(`[ContributionRegistry] Unknown contribution type: ${type}`);
    }
  }

  getContributions() {
    return this.contributions;
  }

  removeContributionsForPlugin(pluginId) {
    this.contributions = this.contributions.filter(c => c.pluginId !== pluginId);
    this.registries.command.unregisterByPluginId(pluginId);
    this.registries.shortcut.unregisterByPluginId(pluginId);
    this.registries.toolbar.unregisterByPluginId(pluginId);
    this.registries.menu.unregisterByPluginId(pluginId);
    this.registries.template.unregisterByPluginId(pluginId);
  }
}
