/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getDisplayName } from '../../utils';
import Portal from './Portal';

import styles from '../../styles/modals/modal.module.scss';

const propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    position: PropTypes.oneOf(['center', 'top']),
    children: PropTypes.node,
};

const defaultProps = {
    id: null,
    title: null,
    position: 'center',
    children: null,
};

const Modal = ({ id, children, position, title }) => {
    const finalId = useMemo(() => id || getDisplayName(children.type), [id, children.type]);
    const data = useMemo(
        () => ({
            title,
        }),
        [title],
    );
    return (
        <Portal id={finalId} data={data}>
            <div
                className={classNames([
                    styles.container,
                    {
                        [styles[position]]: position !== null,
                    },
                ])}
            >
                <div className={styles.inner}>{children}</div>
            </div>
        </Portal>
    );
};

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;

export default Modal;
