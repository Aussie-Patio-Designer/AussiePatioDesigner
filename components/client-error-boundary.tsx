"use client"

import type { ErrorInfo, ReactNode } from "react"
import { Component } from "react"

interface ClientErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ClientErrorBoundaryState {
  error: Error | null
}

export class ClientErrorBoundary extends Component<ClientErrorBoundaryProps, ClientErrorBoundaryState> {
  state: ClientErrorBoundaryState = {
    error: null,
  }

  static getDerivedStateFromError(error: Error): ClientErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { children, fallback } = this.props
    const { error } = this.state

    if (error) {
      if (typeof fallback === "function") {
        return fallback(error, this.reset)
      }

      return fallback ?? null
    }

    return children
  }
}
