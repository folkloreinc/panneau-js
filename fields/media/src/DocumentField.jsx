/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import MediaField from './MediaField';

const DocumentField = (props) => {
    const fileTypes = useMemo(() => ['.pdf'], []);
    const types = useMemo(() => ['document'], []);
    return <MediaField {...props} fileTypes={fileTypes} types={types} />;
};

export default DocumentField;
