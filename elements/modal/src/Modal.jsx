/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getDisplayName } from '@panneau/core/utils';

import ModalPortal from './ModalPortal';

import styles from './styles.module.css';

const propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    position: PropTypes.oneOf(['center', 'top']),
    onClose: PropTypes.func,
    children: PropTypes.node,
};

const Modal = ({
    id = null,
    onClose = null,
    children = null,
    position = 'center',
    title = null
}) => {
    const name = getDisplayName(children);
    const finalId = useMemo(() => id || name || 'Modal', [id, name]);
    const data = useMemo(
        () => ({
            title,
            onClose,
        }),
        [title, onClose],
    );
    return (
        <ModalPortal id={finalId} data={data}>
            <div
                className={classNames([
                    styles.modal,
                    {
                        [styles[position]]: position !== null,
                    },
                ])}
            >
                <div
                    className={classNames(['modal', 'fade', 'show', 'd-block', styles.inner])}
                    tabIndex="-1"
                >
                    {children}
                </div>
            </div>
        </ModalPortal>
    );
};

Modal.propTypes = propTypes;

export default Modal;
