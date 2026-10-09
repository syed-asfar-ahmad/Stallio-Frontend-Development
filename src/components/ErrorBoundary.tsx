import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import i18n from '../i18n/config';

type Props = { children: ReactNode; fallback?: ReactNode | ((error: Error | null) => ReactNode) };
type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught a render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return fallback(this.state.error);
      if (fallback) return fallback;
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
          <p className="text-stone-600 font-medium mb-4">{i18n.t('dashboard.error.loadPage')}</p>
          <Link to="/dashboard" className="text-brand-600 font-semibold hover:underline">{i18n.t('dashboard.error.back')}</Link>
        </div>
      );
    }
    return this.props.children;
  }
}
