import React from 'react'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { SortableElement } from 'react-sortable-hoc';

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

const ListItemRender = ({ renderItem, value, itemIndex }) => renderItem(value, itemIndex);

ListItemRender.propTypes = propTypes;
ListItemRender.defaultProps = defaultProps;

export default SortableElement(ListItemRender);
