import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import * as TablePropTypes from './PropTypes';
import Column from './Column';

const propTypes = {
    column: TablePropTypes.column.isRequired,
    item: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    item: null,
};

const ImageColumn = ({ item, column }) => {
    const url = get(item, column.path, null);
    const width = column.width || null;
    return (
        <Column {...column}>
            {url !== null && !isEmpty(url) ? (
                <img src={url} alt="" width={width} />
            ) : null}
        </Column>
    );
};

ImageColumn.propTypes = propTypes;
ImageColumn.defaultProps = defaultProps;

export default ImageColumn;
