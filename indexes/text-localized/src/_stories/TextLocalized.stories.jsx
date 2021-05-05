import React from 'react';

import TextLocalized from '../TextLocalized';

export default {
    component: TextLocalized,
    title: 'Index/TextLocalized',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <TextLocalized value={{ fr: 'Allo', en: 'Hello' }} />;
