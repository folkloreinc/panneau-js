import React from 'react';

import ResourceForm from './ResourceForm';

const propTypes = {

};

const defaultProps = {

};

const ResourceEdit = props => (
    <ResourceForm
        action="edit"
        {...props}
    />
);

ResourceEdit.propTypes = propTypes;
ResourceEdit.defaultProps = defaultProps;

export default ResourceEdit;
