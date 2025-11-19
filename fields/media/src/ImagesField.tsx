/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import MediaField from './MediaField';

interface ImagesFieldProps {
    [key: string]: unknown;
}

function ImagesField(props: ImagesFieldProps) {
    const types = useMemo(() => ['image'], []);
    return <MediaField {...props} types={types} allowMultipleUploads />;
}

export default ImagesField;
