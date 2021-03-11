/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as MicromagPropTypes } from '../../lib';
import Label from '../partials/Label';
import Buttons from '../buttons/Buttons';

import styles from '../../styles/modals/dialog.module.scss';

const propTypes = {
    title: MicromagPropTypes.label,
    header: PropTypes.node,
    children: PropTypes.node,
    footer: PropTypes.node,
    buttons: MicromagPropTypes.buttons,
    // theme: PropTypes.oneOf([null, 'dark', 'light']),
    onClickClose: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    title: null,
    header: null,
    children: null,
    footer: null,
    buttons: null,
    // theme: 'dark',
    onClickClose: null,
    className: null,
};

const ModalDialog = ({
    title,
    header,
    children,
    buttons,
    footer,
    // theme,
    onClickClose,
    className,
}) => (
    <div
        className={classNames([
            'modal-dialog',
            styles.container,
            {
                [className]: className,
            },
        ])}
        role="dialog"
    >
        <div className="modal-content">
            {header || (
                <div
                    className={classNames([
                        'modal-header',
                        styles.header,
                        {
                            // 'bg-dark': theme === 'dark',
                            // 'border-dark': theme === 'dark',
                            // 'text-light': theme === 'dark',
                        },
                    ])}
                >
                    <h5 className="modal-title">
                        <Label>{title}</Label>
                    </h5>
                    <button
                        type="button"
                        className="close text-light"
                        aria-label="Close"
                        onClick={onClickClose}
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            )}
            <div
                className={classNames([
                    'modal-body',
                    styles.body,
                    {
                        // [`bg-${theme}`]: theme !== null,
                        // 'text-light': theme === 'dark',
                    },
                ])}
            >
                {children}
            </div>
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
);

ModalDialog.propTypes = propTypes;
ModalDialog.defaultProps = defaultProps;

export default ModalDialog;
