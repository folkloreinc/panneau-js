import classNames from 'classnames';
import { useMemo } from 'react';

import { useActionsComponentsManager } from '@panneau/core/contexts';
import type { ButtonSize, Filter, Item, Resource } from '@panneau/core/types';
import Button from '@panneau/element-button';

interface Action extends Filter {
    multiple?: boolean;
    global?: boolean;
    disabled?: boolean;
    outline?: boolean;
    withConfirmation?: boolean;
}

interface ActionsProps {
    resource?: Resource;
    actions?: Action[];
    value?: Item[] | null;
    onChange?: ((value: unknown) => void) | null;
    onConfirmed?: ((value: unknown) => void) | null;
    defaultComponent?: React.ComponentType<any>;
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
    onChange = null,
    size = null,
    onConfirmed = null,
    defaultComponent = Button,
    isGroup = false,
    disabled: parentDisabled = false,
    withConfirmation = false,
    className = null,
}: ActionsProps) {
    const actionsComponents = useActionsComponentsManager();

    const disabled = value === null || value.length === 0;
    const finalActions = useMemo(
        () =>
            (actions || [])
                .filter((action) => action !== null)
                .map((action) => {
                    const { multiple = false, global = false } = action || {};
                    const enabled = multiple
                        ? value !== null && value.length > 0
                        : value !== null && value.length === 1;
                    const finalDisabled = !global && (parentDisabled || disabled || !enabled);
                    return {
                        ...action,
                        disabled: finalDisabled,
                        outline: finalDisabled,
                    };
                }),
        [disabled, value, actions, parentDisabled],
    );

    return (
        <div
            className={classNames([
                {
                    'd-flex': !isGroup,
                    'btn-group': isGroup,
                    [`btn-group-${size}`]: isGroup && size !== null,
                    [className!]: className !== null,
                },
            ])}
        >
            {finalActions.map((action, idx) => {
                const {
                    id = null,
                    component = null,
                    multiple = false,
                    withConfirmation: actionConfirmation = false,
                    ...otherProps
                } = action || {};

                const actionComponent = actionsComponents.getComponent(component);
                const hasActionComponent = actionComponent !== null;
                const Component = actionComponent || defaultComponent;
                const [firstValue = null] = value || [];
                const finalValue = !multiple && firstValue !== null ? firstValue : value;
                return Component !== null ? (
                    <Component
                        id={id}
                        key={`action-${id}-${idx + 1}`}
                        className={!isGroup ? 'me-2' : null}
                        iconPosition="right"
                        value={finalValue}
                        size={size}
                        multiple={multiple}
                        resource={resource}
                        {...(hasActionComponent
                            ? {
                                  onChange,
                                  onConfirmed,
                                  withConfirmation: actionConfirmation || withConfirmation,
                              }
                            : null)}
                        {...otherProps}
                    />
                ) : null;
            })}
        </div>
    );
}

export default Actions;
