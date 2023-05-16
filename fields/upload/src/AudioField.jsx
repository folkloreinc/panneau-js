/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import UploadField from './UploadField';

const AudioField = (props) => {
    const types = useMemo(() => ['audio'], []);
    return <UploadField {...props} types={types} />;
};

export default AudioField;
