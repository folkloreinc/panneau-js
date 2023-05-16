/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import UploadField from './UploadField';

const DocumentField = (props) => {
    const fileTypes = useMemo(() => ['.pdf'], []);
    return <UploadField {...props} fileTypes={fileTypes} />;
};

export default DocumentField;
