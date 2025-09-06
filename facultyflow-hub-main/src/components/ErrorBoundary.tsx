import React from 'react';

type ErrorBoundaryProps = React.PropsWithChildren<{
  fallback?: React.ReactNode;
}>;

type ErrorBoundaryState = {
  hasError: boolean;
  error?: unknown;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // optional: send to Sentry/console
    console.error('Route error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-2">Something went wrong.</h2>
            <p className="text-sm text-muted-foreground">Try refreshing the page.</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
