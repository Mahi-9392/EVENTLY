import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || String(err) }
  }

  componentDidCatch(err) {
    // eslint-disable-next-line no-console
    console.error('UI crashed', err)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="glass mx-auto max-w-2xl rounded-3xl p-10 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {this.state.message}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-gradient !py-2.5 text-sm"
          >
            Reload
          </button>
          <Link to="/" className="btn-gradient-outline text-sm">
            Back to home
          </Link>
        </div>
      </div>
    )
  }
}

