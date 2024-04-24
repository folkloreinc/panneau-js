/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import MediaField from './MediaField';

const FontField = (props) => {
    const fileTypes = useMemo(() => ['.ttf', '.otf'], []);
    return <MediaField {...props} fileTypes={fileTypes} />;
};

export default FontField;
