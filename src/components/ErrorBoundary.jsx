import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/ui/button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log technical details for developers; never show stack traces to users.
    console.error('Application error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-sm text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Something went wrong</h1>
            <p className="text-sm text-slate-500">
              The application encountered an unexpected error. Please try again.
            </p>
            <Button onClick={this.handleReload} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" /> Reload
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}