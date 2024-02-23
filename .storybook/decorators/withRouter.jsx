import { useMemoryRouter } from '@folklore/routes';
import React, { useState } from 'react';
import { Router } from 'wouter';

const withRouter = (Story, { parameters: { router = null } }) => {
    if (router === false) {
        return <Story />;
    }

    const { hook, searchHook } = useMemoryRouter();

    return (
        <Router hook={hook} searchHook={searchHook}>
            <Story />
        </Router>
    );
};

export default withRouter;
