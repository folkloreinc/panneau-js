/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { SortableContainer } from 'react-sortable-hoc';

import SortableItem from './SortableItem';

const propTypes = {
    items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    renderItem: PropTypes.func.isRequired,
    placeholder: PropTypes.node,
};

const defaultProps = {
    placeholder: null,
};

const ListItemSortable = ({
    items, placeholder, renderItem, ...props
}) => (
    <div className="list" {...props}>
        {items.map((it, index) => (
            <SortableItem
                key={`item_${index}_${it.type}`}
                index={index}
                renderItem={renderItem}
                itemIndex={index}
                value={it}
            />
        ))}
        {placeholder}
    </div>
);

ListItemSortable.propTypes = propTypes;
ListItemSortable.defaultProps = defaultProps;

export default SortableContainer(ListItemSortable);
