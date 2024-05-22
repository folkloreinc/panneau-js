/* eslint-disable react/jsx-props-no-spreading */
import isObject from 'lodash-es/isObject';
import PropTypes from 'prop-types';
import React from 'react';

import ResourceList from '@panneau/list-resource-items';

const propTypes = {
    resource: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ id: PropTypes.string })])
        .isRequired,
};

// Kept for backward compatibility with exports
const ResourceItemsList = ({ resource, ...props }) => {
    const { id: finalResource = null } = isObject(resource) ? resource : { id: resource };
    return <ResourceList resource={finalResource} {...props} />;
};

ResourceItemsList.propTypes = propTypes;

export default ResourceItemsList;
