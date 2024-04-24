/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import MediaField from './MediaField';

const ImagesField = (props) => {
    const types = useMemo(() => ['image'], []);
    return <MediaField {...props} types={types} allowMultipleUploads />;
};

export default ImagesField;
