import classNames from 'classnames';

import { usePanneauColorScheme } from '@panneau/core/contexts';
import type { Label } from '@panneau/core/types';
import LabelComponent from '@panneau/element-label';

interface PageHeaderProps {
    title?: Label | null;
    actions?: React.ReactNode;
    small?: boolean;
    className?: string | null;
    children?: React.ReactNode;
}

function PageHeader({
    title = null,
    actions = null,
    small = false,
    className = null,
    children = null,
}: PageHeaderProps) {
    // TODO: fix page header components
    // const { components } = usePanneau();
    const { text, background } = usePanneauColorScheme();

    const inner = (
        <div className="d-flex align-items-center flex-wrap">
            {title !== null ? (
                <h1 className={classNames(['mb-0', 'h2'])}>
                    <LabelComponent>{title}</LabelComponent>
                </h1>
            ) : null}
            {actions !== null ? <div className="ms-auto">{actions}</div> : null}
        </div>
    );

    return (
        <div
            className={classNames([
                'py-4',
                {
                    [`bg-${background}`]: background !== null,
                    [`text-${text}`]: text !== null,
                    [`border-bottom`]: background || text !== null,
                    [className]: className !== null,
                },
            ])}
        >
            <div className="container-sm">
                {small ? (
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">{inner}</div>
                    </div>
                ) : (
                    inner
                )}
            </div>
            {children}
        </div>
    );
}

export default PageHeader;
