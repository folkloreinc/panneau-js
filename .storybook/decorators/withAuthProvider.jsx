import React from 'react';

import { AuthProvider } from '../../packages/auth/src/contexts/AuthContext';

const withAuthProvider = (Story) => (
    <AuthProvider user={{ id: 1 }}>
        <Story />
    </AuthProvider>
);

export default withAuthProvider;
