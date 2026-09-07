import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import i18n from '../i18n/config';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
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
