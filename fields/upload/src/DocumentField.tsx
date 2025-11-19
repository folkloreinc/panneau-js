/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import UploadField from './UploadField';

interface DocumentFieldProps {
    [key: string]: unknown;
}

function DocumentField(props: DocumentFieldProps) {
    const fileTypes = useMemo(() => ['.pdf'], []);
    const types = useMemo(() => ['document'] as const, []);
    return <UploadField {...props} fileTypes={fileTypes} types={types} />;
}

export default DocumentField;
