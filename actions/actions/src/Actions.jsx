/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useActionsComponentsManager } from '@panneau/core/contexts';
import Button from '@panneau/element-button';

const propTypes = {
    resource: PanneauPropTypes.resource,
    actions: PanneauPropTypes.filters,
    value: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
        }),
    ),
    onChange: PropTypes.func,
    onConfirmed: PropTypes.func,
    defaultComponent: PropTypes.func,
    isGroup: PropTypes.bool,
    size: PropTypes.string,
    disabled: PropTypes.bool,
    withConfirmation: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    resource: null,
    actions: [],
    value: null,
    onChange: null,
    onConfirmed: null,
    defaultComponent: Button,
    isGroup: false,
    size: null,
    disabled: false,
    withConfirmation: false,
    className: null,
};

const Actions = ({
    resource,
    actions,
    value,
    onChange,
    size,
    onConfirmed,
    defaultComponent,
    isGroup,
    disabled: parentDisabled,
    withConfirmation,
    className,
}) => {
    const actionsComponents = useActionsComponentsManager();

    const disabled = value === null || value.length === 0;
    const finalActions = useMemo(
        () =>
            (actions || [])
                .filter((action) => action !== null)
                .map(
                    (action) => {
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
                    },
                    [actions],
                ),
        [disabled, value, actions, parentDisabled],
    );

    return (
        <div
            className={classNames([
                {
                    'd-flex': !isGroup,
                    'btn-group': isGroup,
                    [`btn-group-${size}`]: isGroup && size !== null,
                    [className]: className !== null,
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
};

Actions.propTypes = propTypes;
Actions.defaultProps = defaultProps;

export default Actions;
