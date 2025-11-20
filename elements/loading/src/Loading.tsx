import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Label } from '@panneau/core/types';

interface LoadingProps {
    theme?: string | null;
    delay?: number;
    withDelay?: boolean;
    withoutCard?: boolean;
    className?: string | null;
    children?: Label | null;
}

function Loading({
    theme = null,
    delay = 300,
    withDelay = false,
    withoutCard = false,
    className = null,
    children = null,
}: LoadingProps) {
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
                <div
                    className={classNames([
                        'spinner-border',
                        { [`text-${theme}`]: theme !== null },
                    ])}
                >
                    <span className="visually-hidden">
                        <FormattedMessage defaultMessage="Loading" description="Loading message" />
                    </span>
                </div>
                {children !== null ? (
                    <div className={classNames(['mx-2', { [`text-${theme}`]: theme !== null }])}>
                        {children}
                    </div>
                ) : null}
            </div>
        </div>
    ) : null;
}

export default Loading;
