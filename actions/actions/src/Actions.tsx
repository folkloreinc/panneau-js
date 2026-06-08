import classNames from 'classnames';
import type { ComponentType } from 'react';

import type { Action, ActionValue, ButtonSize, Resource } from '@panneau/core';
import { useActionsComponentsManager } from '@panneau/core/contexts';
import Button from '@panneau/element-button';

import useActions, { UseActionsOptions } from './useActions';

interface ActionsProps extends UseActionsOptions {
    resource?: Resource;
    actions?: Action[];
    value?: ActionValue;
    onChange?: ((value: ActionValue) => void) | null;
    defaultComponent?: ComponentType<any>;
    isGroup?: boolean;
    size?: ButtonSize;
    disabled?: boolean;
    withConfirmation?: boolean;
    className?: string | null;
}

const DEFAULT_ACTIONS: Action[] = [];

function Actions({
    resource,
    actions = DEFAULT_ACTIONS,
    value = null,
    size = null,
    defaultComponent = Button,
    isGroup = false,
    disabled = false,
    withConfirmation = false,
    className = null,
    ...globalProps
}: ActionsProps) {
    const actionsComponents = useActionsComponentsManager();

    const finalActions = useActions(actions, value, {
        disabled,
        resource,
        ...globalProps
    });

    return (
        <div
            className={classNames([
                {
                    'd-flex': !isGroup,
                    'btn-group': isGroup,
                    [`btn-group-${size}`]: isGroup && size !== null,
                },
                className
            ])}
        >
            {finalActions.map((action, idx) => {
                const {
                    id = null,
                    component = null,
                    withConfirmation: actionConfirmation = false,
                    ...otherProps
                } = action || {};

                const actionComponent = actionsComponents.getComponent(component);
                const Component = actionComponent || defaultComponent;
                return Component !== null ? (
                    <Component
                        id={id}
                        key={`action-${id}-${idx + 1}`}
                        className={!isGroup ? 'me-2' : null}
                        iconPosition="right"
                        value={value}
                        size={size}
                        resource={resource}
                        withConfirmation={actionConfirmation || withConfirmation}
                        {...globalProps}
                        {...otherProps}
                    />
                ) : null;
            })}
        </div>
    );
}

export default Actions;
