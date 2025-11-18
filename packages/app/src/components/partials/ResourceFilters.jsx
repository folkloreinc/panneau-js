/* eslint-disable react/jsx-props-no-spreading */
// import PropTypes from 'prop-types';
import React from 'react';

import Filters from '@panneau/filter-filters';

// Kept for backward compatibility with exports
function ResourceFilters(props) {
    return <Filters {...props} />;
}

export default ResourceFilters;
