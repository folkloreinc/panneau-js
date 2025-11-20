import { useMemo } from 'react';

import MediaField from './MediaField';

interface DocumentFieldProps {
    [key: string]: unknown;
}

function DocumentField(props: DocumentFieldProps) {
    const fileTypes = useMemo(() => ['.pdf'], []);
    const types = useMemo(() => ['document'], []);
    return <MediaField {...props} fileTypes={fileTypes} types={types} />;
}

export default DocumentField;
