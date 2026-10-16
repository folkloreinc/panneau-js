import { Component, type ErrorInfo, type ReactNode } from 'react';

interface FieldErrorBoundaryProps {
    /** What to show instead of the field, with a function that renders it again. */
    fallback: (retry: () => void) => ReactNode;
    onError?: (error: unknown, info: ErrorInfo) => void;
    children?: ReactNode;
}

interface FieldErrorBoundaryState {
    failed: boolean;
}

/** Keeps a field that throws from taking the whole form down (decision 0006). */
export class FieldErrorBoundary extends Component<
    FieldErrorBoundaryProps,
    FieldErrorBoundaryState
> {
    override state: FieldErrorBoundaryState = { failed: false };

    static getDerivedStateFromError(): FieldErrorBoundaryState {
        return { failed: true };
    }

    override componentDidCatch(error: unknown, info: ErrorInfo) {
        this.props.onError?.(error, info);
    }

    override render() {
        if (this.state.failed) {
            return this.props.fallback(() => this.setState({ failed: false }));
        }
        return this.props.children;
    }
}
