import { useMemo } from 'react';

import UploadField from './UploadField';

interface AudioFieldProps {
    [key: string]: unknown;
}

function AudioField(props: AudioFieldProps) {
    const types = useMemo(() => ['audio'] as const, []);
    return <UploadField {...props} types={types} />;
}

export default AudioField;
