/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import pageResource from '../../../../.storybook/data/page-resource';
import { ResourceProvider } from '../../../../packages/core/contexts';

import FormActions from '../FormActions';

export default {
    component: FormActions,
    title: 'Elements/FormActions',
    parameters: {
        intl: true,
    },
};

const props = {
    resource: pageResource,
    item: {
        id: 1,
    },
    size: 'sm',
};

export const Normal = () => <ResourceProvider resource={pageResource}><FormActions {...props} /></ResourceProvider>;
