/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import UploadField from './UploadField';

interface FontFieldProps {
    [key: string]: unknown;
}

function FontField(props: FontFieldProps) {
    const fileTypes = useMemo(() => ['.ttf', '.otf'], []);
    return <UploadField {...props} fileTypes={fileTypes} />;
}

export default FontField;
