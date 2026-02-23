import classNames from 'classnames';
import isArray from 'lodash-es/isArray';
import type { ComponentType } from 'react';
import { useMemo } from 'react';

import { useActionsComponentsManager } from '@panneau/core/contexts';
import type { Action, ActionValue, ButtonSize, Resource } from '@panneau/core/types';
import Button from '@panneau/element-button';

import useActions from './useActions';

interface ActionsProps {
    resource?: Resource;
    actions?: Action[];
    value?: ActionValue;
    onChange?: ((value: unknown) => void) | null;
    onConfirmed?: ((value: unknown) => void) | null;
    defaultComponent?: ComponentType<any>;
    isGroup?: boolean;
    size?: ButtonSize;
    disabled?: boolean;
    withConfirmation?: boolean;
    iconsOnly?: boolean;
    showLabel?: string | null;
    editLabel?: string | null;
    deleteLabel?: string | null;
    onClickShow?: (() => void) | null;
    onClickEdit?: (() => void) | null;
    onClickDelete?: (() => void) | null;
    getShowPropsFromValue?: ((item: ActionValue) => Record<string, unknown>) | null;
    getEditPropsFromValue?: ((item: ActionValue) => Record<string, unknown>) | null;
    getDeletePropsFromValue?: ((item: ActionValue) => Record<string, unknown>) | null;
    showUrl?: string | null;
    withoutItemShowUrl?: boolean | null;
    preferEditModal?: boolean;
    preferDeleteModal?: boolean;
    hasDuplicateRoute?: boolean;
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
    disabled = false,
    withConfirmation = false,
    className = null,
    iconsOnly = true,
    showLabel = null,
    editLabel = null,
    deleteLabel = null,
    onClickShow = null,
    onClickEdit = null,
    onClickDelete = null,
    getShowPropsFromValue = null,
    getEditPropsFromValue = null,
    getDeletePropsFromValue = null,
    showUrl = null,
    withoutItemShowUrl = null,
    preferEditModal = false,
    preferDeleteModal = false,
    hasDuplicateRoute = false,
    ...globalProps
}: ActionsProps) {
    const actionsComponents = useActionsComponentsManager();

    const finalActions = useActions(actions, value, {
        disabled,
        resource,
        iconsOnly,
        showLabel,
        editLabel,
        deleteLabel,
        onClickShow,
        onClickEdit,
        onClickDelete,
        getShowPropsFromValue,
        getEditPropsFromValue,
        getDeletePropsFromValue,
        showUrl,
        withoutItemShowUrl,
        preferEditModal,
        preferDeleteModal,
        hasDuplicateRoute,
    });

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
                const [firstValue = null] = isArray(value) ? value : [];
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
                        {...globalProps}
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
