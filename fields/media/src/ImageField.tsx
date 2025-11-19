/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import MediaField from './MediaField';

interface ImageFieldProps {
    [key: string]: unknown;
}

function ImageField(props: ImageFieldProps) {
    const types = useMemo(() => ['image'], []);
    return <MediaField {...props} types={types} />;
}

export default ImageField;
