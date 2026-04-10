import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-space-dark text-white flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">¡Ups! Algo salió mal.</h1>
          <p className="text-gray-400 mb-6">Ha ocurrido un error inesperado.</p>
          <pre className="bg-black/50 p-4 rounded-xl text-left text-xs overflow-auto max-w-full border border-red-500/30">
            {this.state.error?.message}
          </pre>
          <button
            className="mt-8 px-6 py-3 bg-cyan-neon text-space-dark font-bold rounded-xl"
            onClick={() => window.location.reload()}
          >
            Recargar aplicación
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
