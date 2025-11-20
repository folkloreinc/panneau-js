import { useMemo } from 'react';

import MediaField from './MediaField';

interface FontFieldProps {
    [key: string]: unknown;
}

function FontField(props: FontFieldProps) {
    const fileTypes = useMemo(() => ['.ttf', '.otf'], []);
    return <MediaField {...props} fileTypes={fileTypes} />;
}

export default FontField;
