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
    onClickClose: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    title: null,
    size: null,
    header: null,
    children: null,
    footer: null,
    buttons: null,
    onClickClose: null,
    className: null,
};

const ModalDialog = ({
    title,
    size,
    header,
    children,
    buttons,
    footer,
    onClickClose,
    className,
}) => (
    <Modal>
        <div
            className={classNames([
                'modal-dialog',
                styles.container,
                {
                    [`modal-${size}`]: size !== null,
                    [className]: className,
                },
            ])}
            role="dialog"
        >
            <div className="modal-content">
                {header || (
                    <div className={classNames(['modal-header', styles.header])}>
                        <h5 className="modal-title pe-2">
                            {isMessage ? <Label>{title}</Label> : title}
                        </h5>
                        <Button
                            type="button"
                            className="btn-close close"
                            aria-label="Close"
                            onClick={onClickClose}
                        />
                    </div>
                )}
                <div className={classNames(['modal-body', styles.body])}>{children}</div>
                {footer !== null || buttons !== null ? (
                    <div className={classNames(['modal-footer', styles.footer])}>
                        {footer}
                        {buttons !== null ? (
                            <Buttons buttons={buttons} className={styles.buttons} />
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    </Modal>
);

ModalDialog.propTypes = propTypes;
ModalDialog.defaultProps = defaultProps;

export default ModalDialog;
