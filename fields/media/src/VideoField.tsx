import { useMemo } from 'react';

import MediaField from './MediaField';

interface VideoFieldProps {
    [key: string]: unknown;
}

function VideoField(props: VideoFieldProps) {
    const types = useMemo(() => ['video'] as const, []);
    return <MediaField {...props} types={types} />;
}

export default VideoField;
