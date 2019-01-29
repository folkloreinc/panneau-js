import React from 'react';

import ResourceForm from './ResourceForm';

const propTypes = {

};

const defaultProps = {

};

const ResourceShow = props => (
    <ResourceForm
        readOnly
        {...props}
    />
);

ResourceShow.propTypes = propTypes;
ResourceShow.defaultProps = defaultProps;

export default ResourceShow;
