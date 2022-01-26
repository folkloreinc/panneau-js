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
            'position-relative': true,
            'px-0': true,
            'py-0': true,
            [className]: className !== null,
        })}
    >
        <div className="px-2 py-1">
            <span className="fas fa-arrows-alt-v" />
        </div>
    </button>
);

SortableHandle.propTypes = propTypes;
SortableHandle.defaultProps = defaultProps;

export default createSortableHandle(SortableHandle);
