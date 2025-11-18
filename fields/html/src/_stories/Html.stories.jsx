/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import HtmlField from '../HtmlField';

export default {
    title: 'Fields/Html',
    component: HtmlField,
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

export const WithMediaEmbed = {
    render: () => (

    <Container
        type="ck-editor"
        placeholder="Using CK Editor"
        ckConfig={{ toolbar: ['mediaEmbed'] }}
    />

    ),
};