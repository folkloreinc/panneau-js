/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import MediaField from './MediaField';

function ImageField(props) {
    const types = useMemo(() => ['image'], []);
    return <MediaField {...props} types={types} />;
}

export default ImageField;
