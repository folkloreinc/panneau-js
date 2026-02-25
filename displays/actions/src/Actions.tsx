import { type ReactNode } from 'react';

import Actions from '@panneau/action-actions';
import type { Item } from '@panneau/core';

interface ActionsDisplayProps {
    item: Item;
    value: unknown;
    className?: string | null;
    buttonsClassName?: string | null;
}

const DEFAULT_ACTIONS = ['show', 'edit', 'delete'];

function ActionsDisplay({
    item,
    value: displayValue = null,
    className = null,
    buttonsClassName = null,
    ...props
}: ActionsDisplayProps) {
    // const { locale = null } = useIntl();
    // const { urlGenerator, ...otherProps } = actionsProps || {};
    // const finalActions = useActions(item, actions, parentUrlGenerator || urlGenerator, {
    //     ...otherProps,
    //     locale,
    // });
    return (
        <div className={className}>
            <Actions {...props} value={displayValue || item} className={buttonsClassName} isGroup />
        </div>
    );
}

export default ActionsDisplay;
