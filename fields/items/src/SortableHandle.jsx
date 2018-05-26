import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { SortableHandle as createSortableHandle } from 'react-sortable-hoc';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: PropTypes.string,
};

const SortableHandle = ({ className }) => (
    <button
        type="button"
        className={classNames({
            btn: true,
            'btn-outline-secondary': true,
            [className]: className !== null,
        })}
    >
        <span className="fas fa-arrows-alt-v" />
    </button>
);

SortableHandle.propTypes = propTypes;
SortableHandle.defaultProps = defaultProps;

export default createSortableHandle(SortableHandle);
