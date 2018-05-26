/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { SortableContainer as createSortableList } from 'react-sortable-hoc';

import SortableItem from './SortableItem';

const propTypes = {
    items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    renderItem: PropTypes.func.isRequired,
    placeholder: PropTypes.node,
};

const defaultProps = {
    placeholder: null,
};

const SortableList = ({
    items, placeholder, renderItem, ...props
}) => (
    <div className="list" {...props}>
        {items.map((it, index) => (
            <SortableItem
                key={`item_${index}_${it !== null ? it.type || null : null}`}
                index={index}
                renderItem={renderItem}
                itemIndex={index}
                value={it}
            />
        ))}
        {placeholder}
    </div>
);

SortableList.propTypes = propTypes;
SortableList.defaultProps = defaultProps;

export default createSortableList(SortableList);
