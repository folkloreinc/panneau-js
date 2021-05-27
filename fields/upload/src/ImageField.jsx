/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import UploadField from './UploadField';

const ImageField = (props) => <UploadField {...props} types={['image']} />;

export default React.memo(ImageField);