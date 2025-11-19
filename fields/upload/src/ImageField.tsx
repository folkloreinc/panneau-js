/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import UploadField from './UploadField';

interface ImageFieldProps {
    [key: string]: unknown;
}

function ImageField(props: ImageFieldProps) {
    const types = useMemo(() => ['image'] as const, []);
    return <UploadField {...props} types={types} />;
}

export default ImageField;
