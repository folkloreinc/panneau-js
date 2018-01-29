import React from 'react';

import MediaField from './MediaField';
import PictureComponent from './MediaPicture';

const PictureField = props => (
    <MediaField type="picture" MediaComponent={PictureComponent} {...props} />
);

export default PictureField;
