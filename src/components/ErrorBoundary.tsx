'use client'
import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e.message } }
  render() {
    if (this.state.error) return (
      <div style={{ color: 'red', padding: '20px', background: '#1a0000', borderRadius: '8px' }}>
        <b>Erro no componente:</b><br />{this.state.error}
      </div>
    )
    return this.props.children
  }
}