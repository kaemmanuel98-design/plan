import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('E&M error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-aw-bg p-8">
          <div className="aw-card-inner max-w-md p-10 text-center">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h2 className="font-display text-2xl mb-2">Erreur d'affichage</h2>
            <p className="text-sm text-aw-muted mb-6">{this.state.message}</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Recharger
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
