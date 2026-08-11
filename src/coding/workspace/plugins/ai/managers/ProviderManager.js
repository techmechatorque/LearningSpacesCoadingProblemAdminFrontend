import { MockAIProvider } from '../adapters/MockAIProvider';

export class ProviderManager {
  constructor() {
    this.activeProvider = new MockAIProvider();
  }

  getProvider() {
    return this.activeProvider;
  }

  setProvider(providerInstance) {
    this.activeProvider = providerInstance;
  }
}
