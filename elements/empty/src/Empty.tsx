/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Label } from '@panneau/core/types';
import Button from '@panneau/element-button';

interface EmptyProps {
    theme?: string | null;
    message?: React.ReactNode | null;
    button?: Record<string, unknown> | null;
    delay?: number;
    withDelay?: boolean;
    withoutCard?: boolean;
    className?: string | null;
    children?: Label | null;
}

function Empty({
    theme = null,
    message = null,
    button = null,
    delay = 300,
    withDelay = false,
    withoutCard = false,
    className = null,
    children = null
}: EmptyProps) {
    const [visible, setVisible] = useState(!withDelay);

    useEffect(() => {
        const id = setTimeout(() => {
            setVisible(true);
        }, delay);
        return () => {
            clearTimeout(id);
        };
    }, [setVisible, delay]);

    return visible ? (
        <div
            className={classNames([
                {
                    card: !withoutCard,
                    [className!]: className !== null,
                },
            ])}
        >
            <div className="card-body d-flex align-items-center justify-content-center text-muted">
                {children !== null ? (
                    <div className={classNames(['mx-2', { [`text-${theme}`]: theme !== null }])}>
                        {children}
                    </div>
                ) : (
                    <div className={classNames([{ [`text-${theme}`]: theme !== null }])}>
                        {message || (
                            <FormattedMessage defaultMessage="Empty" description="Empty message" />
                        )}
                    </div>
                )}
            </div>
            {button !== null ? (
                <div className="card-footer d-flex align-items-center justify-content-center">
                    <Button {...button} />
                </div>
            ) : null}
        </div>
    ) : null;
}

export default Empty;
