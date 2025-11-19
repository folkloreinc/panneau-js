import classNames from 'classnames';
import React from 'react';

import type { ButtonTheme, Label } from '@panneau/core/types';
import Button from '@panneau/element-button';
import Icon from '@panneau/element-icon';
import LabelComponent from '@panneau/element-label';

interface AlertProps {
    theme?: ButtonTheme;
    children: Label;
    onClose?: (() => void) | null;
    className?: string | null;
}

function Alert({
    theme = 'success',
    children,
    onClose = null,
    className = null
}: AlertProps) {
    return (
    <div
        className={classNames([
            'alert',
            `alert-${theme}`,
            // 'alert-dismissible',
            'show',
            'd-flex',
            'align-items-center',
            'justify-content-between',
            {
                [className!]: className !== null,
            },
        ])}
    >
        <LabelComponent>{children}</LabelComponent>
        <Button
            type="button"
            className={classNames([`btn-outline-${theme}`, 'ms-2'])}
            aria-label="Close"
            onClick={onClose}
        >
            <Icon name="x-lg" bold className="d-block" />
        </Button>
    </div>
    );
}

export default Alert;
