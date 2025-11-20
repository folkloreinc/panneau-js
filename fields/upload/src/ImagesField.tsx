import { useMemo } from 'react';

import UploadField from './UploadField';

interface ImagesFieldProps {
    [key: string]: unknown;
}

function ImagesField(props: ImagesFieldProps) {
    const types = useMemo(() => ['image'] as const, []);
    return <UploadField {...props} types={types} allowMultipleUploads />;
}

export default ImagesField;
