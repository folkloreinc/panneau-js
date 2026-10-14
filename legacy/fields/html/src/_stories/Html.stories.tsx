import { useState } from 'react';

import HtmlField from '../HtmlField';

export default {
    title: 'Fields/Html',
    component: HtmlField,
    parameters: {
        intl: true,
    },
};

function Container(props) {
    const [value, setValue] = useState(null);
    return (
        <>
            <button type="button" className="mb-2" onClick={() => setValue(null)}>
                Reset
            </button>
            <HtmlField {...props} value={value} onChange={setValue} />
        </>
    );
}

export const Normal = {
    render: () => <Container />,
};

export const Inline = {
    render: () => <Container inline />,
};

export const Disabled = {
    render: () => <Container disabled />,
};
