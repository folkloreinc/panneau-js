import React from 'react';
import { MemoryRouter } from 'react-router';

const withRouter = (Story) => {
    return (
        <MemoryRouter>
            <Story />
        </MemoryRouter>
    );
};

export default withRouter;
