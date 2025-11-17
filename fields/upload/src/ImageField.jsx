/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import UploadField from './UploadField';

function ImageField(props) {
    const types = useMemo(() => ['image'], []);
    return <UploadField {...props} types={types} />;
}

export default ImageField;
