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
    setSelectedItems: PropTypes.func,
    defaultComponent: PropTypes.func,
    isGroup: PropTypes.bool,
    size: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    resource: null,
    actions: [],
    value: null,
    onChange: null,
    setSelectedItems: null,
    defaultComponent: Button,
    isGroup: false,
    size: null,
    className: null,
};

const Actions = ({
    resource,
    actions,
    value,
    onChange,
    size,
    setSelectedItems,
    defaultComponent,
    isGroup,
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
                        const { multiple = false } = action || {};
                        const enabled = multiple
                            ? value !== null && value.length > 0
                            : value !== null && value.length === 1;
                        const finalDisabled = disabled || !enabled;
                        return {
                            ...action,
                            disabled: finalDisabled,
                            outline: finalDisabled,
                        };
                    },
                    [actions],
                ),
        [disabled, value, actions],
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
            {finalActions.map((action) => {
                const { component = null } = action || {};
                const actionComponent = actionsComponents.getComponent(component) || null;
                const Component = actionComponent || defaultComponent;
                return Component !== null ? (
                    <Component
                        {...action}
                        className={!isGroup ? 'me-2' : null}
                        value={value}
                        size={size}
                        resource={resource}
                        onChange={onChange}
                        setSelectedItems={setSelectedItems}
                    />
                ) : null;
            })}
        </div>
    );
};

Actions.propTypes = propTypes;
Actions.defaultProps = defaultProps;

export default Actions;
