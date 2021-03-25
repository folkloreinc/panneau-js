import React, { useState } from 'react';

import Search from '../Search';

import resource from '../../../../.storybook/data/resource';
import fields from '../../../../.storybook/data/fields';

export default {
    component: Search,
    title: 'Filters/Search',
    parameters: {
        intl: true,
    },
};

const FieldContainer = () => {
    const [value, setValue] = useState(null);
    return <Search value={value} onChange={setValue} />;
};

export const Normal = () => <FieldContainer resource={resource} fields={fields} />;
