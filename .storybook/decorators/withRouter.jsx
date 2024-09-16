import { useMemoryRouter } from '@folklore/routes';
import React from 'react';
import { Router } from 'wouter';

const withRouter = (Story, { parameters: { router = null } }) => {
    const { hook, searchHook } = useMemoryRouter();

    if (router === false) {
        return <Story />;
    }

    return (
        <Router hook={hook} searchHook={searchHook}>
            <Story />
        </Router>
    );
};

export default withRouter;
