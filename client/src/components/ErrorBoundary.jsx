import { Component } from 'react';

/**
 * If a page crashes, show a friendly message instead of a blank screen.
 * The header, timer and music keep working because they live outside it.
 * (Error boundaries still have to be class components in React.)
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Pomelle page error:', error, info.componentStack);
  }

  componentDidUpdate(previousProps) {
    // Moving to another page clears the error.
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="card page-error" role="alert">
        <h1>Something went wrong on this page</h1>
        <p>Your timer, tasks and saved work are safe. Try another page, or reload.</p>
        <button type="button" className="btn btn--primary btn--small" onClick={() => window.location.reload()}>
          Reload Pomelle
        </button>
      </div>
    );
  }
}
