/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { isMessage } from '@panneau/core/utils';
import Button from '@panneau/element-button';
import Buttons from '@panneau/element-buttons';
import Label from '@panneau/element-label';
import Modal from '@panneau/element-modal';

import styles from './styles.module.scss';

const propTypes = {
    title: PanneauPropTypes.label,
    size: PropTypes.string,
    header: PropTypes.node,
    children: PropTypes.node,
    footer: PropTypes.node,
    buttons: PanneauPropTypes.buttons,
    onClose: PropTypes.func,
    withCloseOutside: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    title: null,
    size: null,
    header: null,
    children: null,
    footer: null,
    buttons: null,
    onClose: null,
    withCloseOutside: false,
    className: null,
};

const ModalDialog = ({
    title,
    size,
    header,
    children,
    buttons,
    footer,
    onClose,
    withCloseOutside,
    className,
}) => {
    const onCloseButtonOutside =
        (header === null && title === null && onClose !== null) ||
        (withCloseOutside && onClose !== null);

    return (
        <Modal>
            <div
                className={classNames([
                    'modal-dialog',
                    styles.container,

                    {
                        [`modal-${size}`]: size !== null,
                        [styles.closeOutside]: onCloseButtonOutside,
                        [className]: className,
                    },
                ])}
                role="dialog"
            >
                <div className="modal-content">
                    {onCloseButtonOutside ? (
                        <Button
                            type="button"
                            className={classNames([
                                styles.closeOutsideButton,
                                'btn',
                                'btn-close',
                                // 'btn-close-white',
                                'btn-secondary',
                                'p-2',
                            ])}
                            aria-label="Close"
                            onClick={onClose}
                        />
                    ) : null}
                    {header !== null ? (
                        header
                    ) : (
                        <div
                            className={classNames([
                                {
                                    'modal-header': title !== null,
                                },
                            ])}
                        >
                            {title !== null ? (
                                <h5 className="modal-title pe-2">
                                    {isMessage ? <Label>{title}</Label> : title}
                                </h5>
                            ) : null}
                            {title !== null && onClose !== null ? (
                                <Button
                                    type="button"
                                    className={classNames(['btn-close', 'close'])}
                                    aria-label="Close"
                                    onClick={onClose}
                                />
                            ) : null}
                        </div>
                    )}
                    <div className={classNames(['modal-body', styles.body])}>{children}</div>
                    {footer !== null || buttons !== null ? (
                        <div className={classNames(['modal-footer', styles.footer])}>
                            {footer !== null ? footer : null}
                            {buttons !== null ? (
                                <Buttons items={buttons} className={styles.buttons} />
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
};

ModalDialog.propTypes = propTypes;
ModalDialog.defaultProps = defaultProps;

export default ModalDialog;
