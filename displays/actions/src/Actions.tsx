import classNames from 'classnames';
import { type ReactNode } from 'react';
import { useIntl } from 'react-intl';

import Actions from '@panneau/action-actions';
import { useActions } from '@panneau/core/hooks';
import type { ButtonSize } from '@panneau/core/types';

interface ActionsDisplayProps {
    item: string | { id: string | number };
    value?: string | Record<string, unknown> | null;
    placeholder?: ReactNode | null;
    actions?: (Record<string, unknown> | string)[] | null;
    urlGenerator?: ((item: unknown) => string) | null;
    actionsProps?: Record<string, unknown> | null;
    size?: ButtonSize;
    theme?: string | null;
    outline?: boolean | null;
    className?: string | null;
    buttonsClassName?: string | null;
}

const DEFAULT_ACTIONS = ['show', 'edit', 'delete'];

function ActionsDisplay({
    item,
    value: _value = null,
    placeholder: _placeholder = null,
    actions = DEFAULT_ACTIONS,
    urlGenerator: parentUrlGenerator = null,
    actionsProps = null,
    size = 'sm',
    theme = null,
    outline = null,
    className = null,
    buttonsClassName = null,
    ...props
}: ActionsDisplayProps) {
    const { locale = null } = useIntl();
    const { urlGenerator, ...otherProps } = actionsProps || {};
    const finalActions = useActions(item, actions, parentUrlGenerator || urlGenerator, {
        ...otherProps,
        locale,
    });
    return (
        <div
            className={classNames([
                {
                    [className!]: className !== null,
                },
            ])}
        >
            <Actions
                {...props}
                className={buttonsClassName}
                actions={finalActions}
                item={item}
                size={size}
                theme={theme}
                outline={outline}
                value={[item]}
                isGroup
            />
        </div>
    );
}

export default ActionsDisplay;
