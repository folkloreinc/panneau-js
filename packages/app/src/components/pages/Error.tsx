import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import type { StatusCode } from '@panneau/core/types';

import GuestLayout from '../layouts/Guest';

interface ErrorPageProps {
    statusCode?: StatusCode | null;
}

function ErrorPage({ statusCode = null }: ErrorPageProps) {
    const code = statusCode || 404;

    const title = useMemo(() => {
        switch (code) {
            case 401:
                return (
                    <FormattedMessage defaultMessage="Error 401" description="Error page title" />
                );
            case 403:
                return (
                    <FormattedMessage defaultMessage="Error 403" description="Error page title" />
                );
            case 404:
                return (
                    <FormattedMessage defaultMessage="Error 404" description="Error page title" />
                );
            case 500:
                return (
                    <FormattedMessage defaultMessage="Error 500" description="Error page title" />
                );
            default:
                return (
                    <FormattedMessage defaultMessage="Error 404" description="Error page title" />
                );
        }
    }, [statusCode]);

    const description = useMemo(() => {
        switch (code) {
            case 401:
                return (
                    <FormattedMessage
                        defaultMessage="You are not authorized to access this page."
                        description="Error page description"
                    />
                );
            case 403:
                return (
                    <FormattedMessage
                        defaultMessage="Access to this page is forbidden"
                        description="Error page description"
                    />
                );
            case 404:
                return (
                    <FormattedMessage
                        defaultMessage="This page doesn't exist"
                        description="Error page description"
                    />
                );
            case 500:
                return (
                    <FormattedMessage
                        defaultMessage="There was an error"
                        description="Error page description"
                    />
                );
            default:
                return (
                    <FormattedMessage
                        defaultMessage="This page doesn't exist"
                        description="Error page description"
                    />
                );
        }
    }, [statusCode]);

    return (
        <GuestLayout fullscreen>
            <div className="container-sm py-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6">
                        <h1>{title}</h1>
                        <p>{description}</p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}

export default ErrorPage;
