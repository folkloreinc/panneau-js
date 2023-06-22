import React, { useState } from 'react';
import { Router } from 'wouter';
import { useLocationProperty } from 'wouter/use-location';

const withRouter = (Story, { parameters: { router = null } }) => {
    if (router === false) {
        return <Story />;
    }

    const [memoryLocation, setMemoryLocation] = useState(null);
    const useMemoryLocation = () => {
        const location = useLocationProperty(() => memoryLocation || '/');
        return [location, setMemoryLocation];
    };
    return (
        <Router hook={useMemoryLocation}>
            <Story />
        </Router>
    );
};

export default withRouter;
