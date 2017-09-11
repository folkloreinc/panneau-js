import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import OutsideClickHandler from '../partials/OutsideClickHandler';

import styles from '../styles/modals/popover.scss';

const propTypes = {
    children: PropTypes.node.isRequired,
    closable: PropTypes.bool,
    className: PropTypes.string,
    onClose: PropTypes.func,
};

const defaultProps = {
    closable: true,
    className: null,
    onClose: null,
};

const Popover = ({ closable, className, children, onClose, ...other }) => {
    const popoverClassName = classNames({
        [styles.popover]: true,
        [className]: className !== null,
    });
    if (closable) {
        return (
            <div className={popoverClassName} {...other}>
                <OutsideClickHandler onOutsideClick={onClose}>
                    { children }
                </OutsideClickHandler>
            </div>

        );
    }
    return (
        <div className={popoverClassName} {...other}>
            { children }
        </div>
    );
};

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;

export default Popover;
