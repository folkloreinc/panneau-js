import React from 'react';

import AccordionElement from '../Accordion';

export default {
    component: AccordionElement,
    title: 'Elements/Accordion',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <AccordionElement />;
