// import { defineMessages } from 'react-intl';
// import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

// import TableList from '@panneau/list-table';

const propTypes = {
    columns: PanneauPropTypes.tableColumns,
};

const defaultProps = {
    columns: null,
};

const MediasList = ({ columns }) => {
    console.log(columns);

    // TODO: make a default nice list for medias,
    // perhaps with the new resource-items thingie or from back-end
    // Not sure

    return (
        <div className="d-flex flex-wrap">
            <p>Media list</p>
            {/* <TableList /> */}
        </div>
    );
};

MediasList.propTypes = propTypes;
MediasList.defaultProps = defaultProps;

export default MediasList;
