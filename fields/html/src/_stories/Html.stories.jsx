/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import HtmlField from '../HtmlField';

export default {
    title: 'Fields/Html',
    component: HtmlField,
};

const Container = (props) => {
    const [value, setValue] = useState(null);
    return (
        <>
            <button type="button" className="mb-2" onClick={() => setValue(null)}>
                Reset
            </button>
            <HtmlField {...props} value={value} onChange={setValue} />
        </>
    );
};

export const Normal = () => <Container />;

export const WithMediaEmbed = () => (
    <Container
        type="ck-editor"
        placeholder="Using CK Editor"
        ckConfig={{ toolbar: ['mediaEmbed'] }}
    />
);
