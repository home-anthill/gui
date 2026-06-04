import { Component, ReactNode } from 'react';

import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: unknown;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
