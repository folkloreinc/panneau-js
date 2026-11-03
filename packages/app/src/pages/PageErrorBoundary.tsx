import { Component, type ReactNode } from 'react';

import { ErrorPage } from './ErrorPage';

interface PageErrorBoundaryProps {
    /** The path of the home page, for the error page's link. */
    homeHref: string;
    /** The current path: going to another one renders the page again. */
    path: string;
    children?: ReactNode;
}

interface PageErrorBoundaryState {
    failed: boolean;
}

/**
 * Keeps a page that throws while it renders from taking the shell down: the error page takes its
 * place, with the sidebar still there. "Try again", or going to another path, renders it again.
 * Without a `key`: a list keeps its state while the panel of an item opens and closes.
 */
export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
    override state: PageErrorBoundaryState = { failed: false };

    static getDerivedStateFromError(): PageErrorBoundaryState {
        return { failed: true };
    }

    override componentDidUpdate(previous: PageErrorBoundaryProps) {
        if (this.state.failed && previous.path !== this.props.path) {
            this.setState({ failed: false });
        }
    }

    override render() {
        if (this.state.failed) {
            return (
                <ErrorPage
                    kind="error"
                    homeHref={this.props.homeHref}
                    onRetry={() => this.setState({ failed: false })}
                />
            );
        }
        return this.props.children;
    }
}
