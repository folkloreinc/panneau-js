/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getComponentFromName } from '@panneau/core/utils';

import { useResourceItems } from '@panneau/data';
import * as ListComponents from './resources';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    type: PropTypes.string,
    paginated: PropTypes.bool,
    component: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),
    onQueryChange: PropTypes.func,
};

const defaultProps = {
    query: null,
    type: null,
    paginated: true,
    component: null,
    onQueryChange: null,
};

const ResourceItemsList = ({
    resource,
    type,
    query,
    onQueryChange,
    paginated,
    component,
    ...props
}) => {
    const { page = 1 } = query || {};
    const items = useResourceItems(resource, query, paginated ? parseInt(page, 10) : null);
    const onListQueryChange = useCallback(
        (newQuery) => {
            if (onQueryChange !== null) {
                onQueryChange(newQuery);
            }
        },
        [onQueryChange],
    );
    const ListComponent = getComponentFromName(ListComponents, type || component, 'table');
    return (
        <ListComponent
            {...props}
            {...items}
            resource={resource}
            query={query}
            onQueryChange={onListQueryChange}
        />
    );
};

ResourceItemsList.propTypes = propTypes;
ResourceItemsList.defaultProps = defaultProps;

export default ResourceItemsList;
