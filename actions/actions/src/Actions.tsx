import classNames from 'classnames';
import { type ComponentType, ReactNode, useState } from 'react';

import type {
    ActionDefinition,
    ActionValue,
    ButtonSize,
    DropdownAlign,
    Resource,
} from '@panneau/core';
import { useActionsComponentsManager } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import Dropdown from '@panneau/element-dropdown';

import useActions, { UseActionsOptions } from './useActions';

export interface ActionsProps extends UseActionsOptions {
    resource?: Resource;
    actions?: ActionDefinition[];
    value?: ActionValue;
    onChange?: ((value: ActionValue) => void) | null;
    defaultComponent?: ComponentType | null;
    isGroup?: boolean;
    isDropdown?: boolean;
    dropdownLabel?: ReactNode | null;
    dropdownIcon?: string;
    dropdownAlign?: DropdownAlign | null;
    size?: ButtonSize;
    disabled?: boolean;
    withConfirmation?: boolean;
    className?: string | null;
}

const DEFAULT_ACTIONS: ActionDefinition[] = ['show', 'edit', 'delete'];

function Actions({
    resource,
    actions = DEFAULT_ACTIONS,
    value = null,
    size = null,
    defaultComponent = Button,
    isGroup = false,
    isDropdown = false,
    dropdownLabel = null,
    dropdownAlign = null,
    dropdownIcon = 'three-dots-vertical',
    disabled = false,
    withConfirmation = false,
    className = null,
    ...globalProps
}: ActionsProps) {
    const actionsComponents = useActionsComponentsManager();

    const finalActions = useActions(actions, value, {
        disabled,
        resource,
        iconsOnly: !isDropdown,
        ...globalProps,
    });

    const actionsElements = finalActions.map((action, idx) => {
        const {
            id = null,
            component = null,
            withConfirmation: actionConfirmation = false,
            iconPosition = isDropdown ? 'left' : 'right',
            label = null,
            icon = null,
            ...otherProps
        } = action || {};

        const actionComponent = actionsComponents.getComponent(component);
        const Component = actionComponent || defaultComponent;
        const actionElement =
            Component !== null ? (
                <Component
                    id={id}
                    key={`action-${id}-${idx + 1}`}
                    className={classNames({
                        'me-2': !isGroup,
                        'dropdown-item': isDropdown,
                    })}
                    iconPosition={iconPosition}
                    iconClassName={classNames({
                        'me-2': label !== null && icon !== null && iconPosition === 'left',
                        'ms-2': label !== null && icon !== null && iconPosition === 'right',
                    })}
                    label={label}
                    icon={icon}
                    value={value}
                    size={size}
                    resource={resource}
                    withConfirmation={actionConfirmation || withConfirmation}
                    {...globalProps}
                    {...otherProps}
                />
            ) : null;
        return isDropdown ? (
            <li key={`action-li-${id}-${idx + 1}`}>{actionElement}</li>
        ) : (
            actionElement
        );
    });
    const [dropdownOpened, setDropdownOpened] = useState(false);
    const onClickDropdownToggle = (e) => {
        e.stopPropagation();
        setDropdownOpened(!dropdownOpened);
    };
    const onClickOutsideDropdown = () => {
        setDropdownOpened(false);
    };

    return (
        <div
            className={classNames([
                {
                    'd-flex': !isGroup && !isDropdown,
                    dropdown: isDropdown,
                    'btn-group': isGroup,
                    [`btn-group-${size}`]: isGroup && size !== null,
                },
                className,
            ])}
        >
            {isDropdown && (
                <Button
                    type="button"
                    className={classNames({
                        ['dropdown-toggle']: dropdownLabel !== null,
                    })}
                    aria-expanded="false"
                    size={size}
                    onClick={onClickDropdownToggle}
                >
                    {dropdownLabel ?? <i className={`bi bi-${dropdownIcon}`} />}
                </Button>
            )}
            {isDropdown ? (
                <Dropdown
                    visible={dropdownOpened}
                    onClickOutside={onClickOutsideDropdown}
                    align={dropdownAlign}
                >
                    {actionsElements}
                </Dropdown>
            ) : (
                actionsElements
            )}
        </div>
    );
}

export default Actions;
