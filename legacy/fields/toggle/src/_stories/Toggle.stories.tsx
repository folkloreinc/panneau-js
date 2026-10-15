import { useState } from 'react';

import ToggleField from '../ToggleField';

export default {
    title: 'Fields/Toggle',
    component: ToggleField,
};

function Container(props = null) {
    const [value, setValue] = useState(null);
    return <ToggleField {...props} value={value} onChange={setValue} />;
}

export const Normal = {
    render: () => <Container />,
};

export const Disabled = {
    render: () => <Container disabled />,
};
