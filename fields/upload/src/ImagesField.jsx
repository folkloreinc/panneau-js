/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import UploadField from './UploadField';

const ImagesField = (props) => {
    const types = useMemo(() => ['image'], []);
    return <UploadField {...props} types={types} allowMultipleUploads />;
};

export default ImagesField;
