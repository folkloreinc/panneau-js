import React from 'react';

import { AuthProvider } from '../../packages/auth/src/contexts/AuthContext';

function withAuthProvider(Story) {
    return (
        <AuthProvider user={{ id: 1 }}>
            <Story />
        </AuthProvider>
    );
}

export default withAuthProvider;
