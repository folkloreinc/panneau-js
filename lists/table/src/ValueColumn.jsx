import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import * as TablePropTypes from './PropTypes';
import Column from './Column';

const propTypes = {
    column: TablePropTypes.column.isRequired,
    item: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    item: null,
};

const ValueColumn = ({ item, column }) => (
    <Column {...column}>{get(item, column.path, null)}</Column>
);

ValueColumn.propTypes = propTypes;
ValueColumn.defaultProps = defaultProps;

export default ValueColumn;
