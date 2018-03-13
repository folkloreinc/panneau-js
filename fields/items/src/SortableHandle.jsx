import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { SortableHandle } from 'react-sortable-hoc';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: PropTypes.string,
};

const ListItemButton = ({ className }) => (
    <button
        type="button"
        className={classNames({
            btn: true,
            'btn-default': true,
            [className]: className !== null,
        })}
    >
        <span className="glyphicon glyphicon-resize-vertical" />
    </button>
);

ListItemButton.propTypes = propTypes;
ListItemButton.defaultProps = defaultProps;

export default SortableHandle(ListItemButton);
