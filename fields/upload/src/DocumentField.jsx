/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import UploadField from './UploadField';

const DocumentField = (props) => {
    const fileTypes = useMemo(() => ['.pdf'], []);
    const types = useMemo(() => ['document'], []);
    return <UploadField {...props} fileTypes={fileTypes} types={types} />;
};

export default DocumentField;
