import { useState } from 'react';

import TogglesField from '../TogglesField';

export default {
    title: 'Fields/Toggles',
    component: TogglesField,
};

const values = [
    { key: '1', label: 'One' },
    { key: '2', label: 'Two' },
    { key: '3', label: 'Three' },
];

function Container(props) {
    const [value, setValue] = useState(null);
    return <TogglesField {...props} value={value} onChange={setValue} />;
}

export const Normal = {
    render: () => <Container toggles={values} />,
};

export const Disabled = {
    render: () => <Container toggles={values} disabled />,
};
