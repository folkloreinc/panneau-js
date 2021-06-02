/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import UploadField from './UploadField';

const AudioField = (props) => <UploadField {...props} types={['audio']} />;

export default React.memo(AudioField);