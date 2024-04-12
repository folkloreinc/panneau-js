import React from 'react';

import TextField from '../../../../fields/text/src/TextField';
import AccordionElement from '../Accordion';

const accordeonItems = [
    {
        label: 'Un texte court',
        content: 'Bonjour le monde',
    },
    {
        label: 'Un TextField',
        content: <TextField />,
    },
    {
        label: 'Du html',
        content: <p>string kdnfsfj</p>,
    },
    {
        label: 'Un long texte',
        content: `This is the second items accordion body. It is hidden by
        default, until the collapse plugin adds the appropriate classes that we use to
        style each element. These classes control the overall appearance, as well as the
        showing and hiding via CSS transitions. You can modify any of this with custom
        CSS or overriding our default variables. Its also worth noting that just about
        any HTML can go within the .accordion-body, though the transition
        does limit overflow.`,
    },
];

export default {
    component: AccordionElement,
    title: 'Elements/Accordion',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <div>
        <div>
            <AccordionElement
                items={accordeonItems}
                title="Un accordéon qui s'ouvre un à la fois"
                oneAtATime
            />
        </div>
        <div style={{ paddingTop: '30px' }}>
            <AccordionElement items={accordeonItems} title="Un accordéon normal" />
        </div>
    </div>
);
