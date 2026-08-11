import React from 'react';
import { workspaceErrorService } from '../services/ErrorService';

export class WorkspaceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    workspaceErrorService.logError('ErrorBoundary', error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#3b0000', color: '#ffb3b3', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Workspace Engine Crashed</h2>
          <p>A fatal rendering error occurred in the workspace layout.</p>
          <pre style={{ background: '#220000', padding: '10px', overflow: 'auto', maxWidth: '80%' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '8px 16px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}
          >
            Attempt Recovery
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
