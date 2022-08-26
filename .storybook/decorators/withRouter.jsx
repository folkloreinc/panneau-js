import React from 'react';
import { MemoryRouter } from 'react-router';

const withRouter = (Story, { parameters: { router = null } }) => {
    if (router === false) {
        return <Story />;
    }
    return (
        <MemoryRouter>
            <Story />
        </MemoryRouter>
    );
};

export default withRouter;
