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
            <button type="button" onClick={() => setValue(null)}>
                Reset
            </button>
            <HtmlField {...props} value={value} onChange={setValue} />
        </>
    );
};

export const Normal = () => <Container type="ck-editor" placeholder="Using CK Editor" />;
export const Quill = () => <Container type="quill" placeholder="Using Quill" />;
