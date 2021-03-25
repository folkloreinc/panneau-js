import React from 'react';
import { AuthProvider } from '../../packages/data/src/contexts/AuthContext';

const withAuthProvider = (Story) => {
    return (
        <AuthProvider user={{ id: 1 }}>
            <Story />
        </AuthProvider>
    );
};

export default withAuthProvider;
