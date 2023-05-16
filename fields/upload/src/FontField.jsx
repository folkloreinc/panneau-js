/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import UploadField from './UploadField';

const FontField = (props) => {
    const fileTypes = useMemo(() => ['.ttf', '.otf'], []);
    return <UploadField {...props} fileTypes={fileTypes} />;
};

export default FontField;
