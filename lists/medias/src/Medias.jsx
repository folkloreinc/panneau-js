// import { defineMessages } from 'react-intl';
// import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import TableList from '@panneau/list-table';

const propTypes = {
    columns: PanneauPropTypes.tableColumns,
};

const defaultProps = {
    columns: null,
};

const MediasList = ({ columns }) => {
    console.log(columns);

    return (
        <div className="d-flex flex-wrap">
            Media list
            <TableList />
        </div>
    );
};

MediasList.propTypes = propTypes;
MediasList.defaultProps = defaultProps;

export default MediasList;
