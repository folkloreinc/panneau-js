import React from 'react';
import { AuthProvider } from '../../packages/app/src/contexts/AuthContext';

const withAuthProvider = (Story) => {
    return (
        <AuthProvider user={{ id: 1 }}>
            <Story />
        </AuthProvider>
    );
};

export default withAuthProvider;
