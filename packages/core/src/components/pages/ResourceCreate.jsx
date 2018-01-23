import React from 'react';

import ResourceForm from './ResourceForm';

const propTypes = {

};

const defaultProps = {

};

const ResourceCreate = props => (
    <ResourceForm
        action="create"
        {...props}
    />
);

ResourceCreate.propTypes = propTypes;
ResourceCreate.defaultProps = defaultProps;

export default ResourceCreate;
