/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import classNames from 'classnames';
import React, { useMemo } from 'react';

import { getDisplayName } from '@panneau/core/utils';

import ModalPortal from './ModalPortal';

import styles from './styles.module.css';

interface ModalProps {
    id?: string | null;
    title?: string | null;
    position?: 'center' | 'top';
    onClose?: (() => void) | null;
    children?: React.ReactNode | null;
}

function Modal({
    id = null,
    onClose = null,
    children = null,
    position = 'center',
    title = null
}: ModalProps) {
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
                    tabIndex={-1}
                >
                    {children}
                </div>
            </div>
        </ModalPortal>
    );
}

export default Modal;
