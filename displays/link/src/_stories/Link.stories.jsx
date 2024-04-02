/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';

import Link from '../Link';

export default {
    component: Link,
    title: 'Displays/Link',
    parameters: {
        intl: true,
    },
};

export const Internal = () => <Link value="/panneau/pages" label="Hallo" />;

export const External = () => <Link value="https://www.google.com" label="Google" external />;

export const withoutLabel = () => <Link value="https://www.google.com" external />;
