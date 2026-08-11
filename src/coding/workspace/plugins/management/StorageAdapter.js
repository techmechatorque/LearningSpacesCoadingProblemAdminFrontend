export class StorageAdapter {
  async save(key, data) { throw new Error('Not implemented'); }
  async load(key) { throw new Error('Not implemented'); }
  async remove(key) { throw new Error('Not implemented'); }
  async listKeys(prefix) { throw new Error('Not implemented'); }
}

export class LocalStorageAdapter extends StorageAdapter {
  constructor(namespace = 'workspace_') {
    super();
    this.namespace = namespace;
  }

  _getKey(key) {
    return `${this.namespace}${key}`;
  }

  async save(key, data) {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);
    localStorage.setItem(this._getKey(key), serialized);
  }

  async load(key) {
    const data = localStorage.getItem(this._getKey(key));
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }

  async remove(key) {
    localStorage.removeItem(this._getKey(key));
  }

  async listKeys(prefix = '') {
    const searchPrefix = this._getKey(prefix);
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(searchPrefix)) {
        // Return key without namespace
        keys.push(k.substring(this.namespace.length));
      }
    }
    return keys;
  }
}
