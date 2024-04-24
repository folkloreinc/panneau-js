/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import MediaField from './MediaField';

const AudioField = (props) => {
    const types = useMemo(() => ['audio'], []);
    return <MediaField {...props} types={types} />;
};

export default AudioField;
