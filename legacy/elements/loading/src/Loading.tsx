import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface LoadingProps {
    theme?: string | null;
    delay?: number;
    withDelay?: boolean;
    withoutCard?: boolean;
    className?: string | null;
    children?: ReactNode;
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
                },
                className,
            ])}
        >
            <div className="card-body d-flex align-items-center justify-content-center text-muted">
                <div
                    className={classNames([
                        'spinner-border',
                        theme !== null ? `text-${theme}` : null,
                    ])}
                >
                    <span className="visually-hidden">
                        <FormattedMessage defaultMessage="Loading" description="Loading message" />
                    </span>
                </div>
                {children !== null ? (
                    <div className={classNames(['mx-2', theme !== null ? `text-${theme}` : null])}>
                        {children}
                    </div>
                ) : null}
            </div>
        </div>
    ) : null;
}

export default Loading;
