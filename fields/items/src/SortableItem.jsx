import React from 'react'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { SortableElement as createSortableElement } from 'react-sortable-hoc';

const propTypes = {
    renderItem: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
        PropTypes.string,
        PropTypes.number,
    ]),
};

const defaultProps = {
    value: null,
};

const SortableItem = ({ renderItem, value, itemIndex }) => renderItem(value, itemIndex);

SortableItem.propTypes = propTypes;
SortableItem.defaultProps = defaultProps;

export default createSortableElement(SortableItem);
