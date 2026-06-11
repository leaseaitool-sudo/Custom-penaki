import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationCircleIcon } from '@/shared/ui/Icons/ExclamationCircleIcon';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Global Error Boundary Caught:', error, errorInfo);
        // We could also log these to an external monitoring service here.
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-lg w-full text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ExclamationCircleIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Something went wrong</h1>
                        <p className="text-slate-500 mb-6">
                            An unexpected error occurred in the application. We've logged the issue and are looking into it.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-slate-100 p-4 rounded-xl text-left overflow-auto mb-6 max-h-48 text-xs font-mono text-slate-700">
                                {this.state.error.message}
                            </div>
                        )}

                        <button
                            onClick={this.handleReload}
                            className="bg-primary hover:bg-primary-focus text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 w-full"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
