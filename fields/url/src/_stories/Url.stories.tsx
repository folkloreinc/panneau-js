import { useState } from 'react';

import UrlField from '../UrlField';

export default {
    title: 'Fields/Url',
    component: UrlField,
    parameters: {
        intl: true,
    },
};

// eslint-disable-next-line react/prop-types
function Container({ value: initialValue, ...props }) {
    const [value, setValue] = useState(initialValue);
    return <UrlField {...props} value={value} onChange={setValue} />;
}

export const Normal = {
    render: () => <Container />,
};

export const Disabled = {
    render: () => <Container disabled value="https://hello" />,
};

export const PrependAndAppend = {
    render: () => <Container prepend="hello" append="goodbye" />,
};

export const Preview = {
    render: () => <Container prepend="https://www.google.com/" preview />,
};

export const Copy = {
    render: () => <Container prepend="https://www.google.com/paul/" copy />,
};

export const WithUrl = {
    render: () => <Container url="https://test.com/chose/" />,
};
