export class ErrorService {
  constructor() {
    this.errors = [];
  }

  logError(source, error, context = {}) {
    const errorEntry = {
      id: Date.now().toString(),
      source,
      message: error.message || String(error),
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };
    
    this.errors.push(errorEntry);
    console.error(`[WorkspaceEngine Error] [${source}]`, error, context);
    
    // In the future, this could emit an event to display a toast,
    // or send analytics to a backend.
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

export const workspaceErrorService = new ErrorService();
