import { useState } from 'react';

import ColorField from '../ColorField';

export default {
    title: 'Fields/Color',
    component: ColorField,
};

function Container(props) {
    const { value: defaultValue = '#F00' } = props || {};
    const [value, setValue] = useState(defaultValue);
    return <ColorField {...props} value={value} onChange={setValue} />;
}

export const Normal = {
    render: () => <Container />,
};

export const NormalAlpha = {
    render: () => <Container withAlpha />,
};

export const NormalEmpty = {
    render: () => <Container value={null} />,
};

export const NormalDisabled = {
    render: () => <Container disabled />,
};

export const Native = {
    render: () => <Container native />,
};

export const NativeDisabled = {
    render: () => <Container native disabled />,
};
