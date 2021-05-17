import React from 'react';
import PropTypes from 'prop-types';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

import Label from '@panneau/element-label';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    values: PropTypes.object, // eslint-disable-line react/forbid-prop-types,
    children: PanneauPropTypes.label.isRequired,
};

const defaultProps = {
    values: null,
};

const ResourceLabel = ({ resource, values, children }) => {
    const { label = null, intl = null } = resource;
    const { values: resourceValues } = intl || {};

    return (
        <Label
            values={{
                label,
                ...resourceValues,
                ...values,
            }}
        >
            {children}
        </Label>
    );
};
ResourceLabel.propTypes = propTypes;
ResourceLabel.defaultProps = defaultProps;

export default ResourceLabel;
