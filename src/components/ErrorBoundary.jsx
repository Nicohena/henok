import { Component } from 'react'

/**
 * ErrorBoundary — catches render-time errors in its subtree and shows a
 * graceful fallback instead of a white screen.
 *
 * Use cases:
 *   - Wrapping <Canvas> trees (WebGL context loss, malformed GLB, etc.)
 *   - Wrapping lazy-loaded sections (chunk load failures)
 *   - Wrapping any component that touches browser APIs React doesn't manage
 *
 * Usage:
 *   <ErrorBoundary fallback={<StaticFallback />} onError={handleError}>
 *     <MainScene />
 *   </ErrorBoundary>
 *
 * Props:
 *   - fallback: ReactNode or (error, reset) => ReactNode. Shown on error.
 *   - onError: (error, errorInfo) => void. Called when an error is caught.
 *     Use this to dismiss loading screens, log to Sentry, etc.
 *
 * Note: Error boundaries do NOT catch errors in:
 *   - Event handlers (use try/catch)
 *   - setTimeout / requestAnimationFrame callbacks (use try/catch)
 *   - Server-side rendering
 *   - Errors thrown in the boundary's own constructor
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Forward to optional onError callback for side-effects
    // (dismiss loading screens, log to Sentry, etc.)
    this.props.onError?.(error, errorInfo)
    // Log to console for debugging.
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props
      if (typeof fallback === 'function') {
        return fallback(this.state.error, this.reset)
      }
      return fallback ?? null
    }
    return this.props.children
  }
}
