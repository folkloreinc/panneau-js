/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useActionsComponentsManager } from '@panneau/core/contexts';

const propTypes = {
    resource: PanneauPropTypes.resource,
    actions: PanneauPropTypes.filters,
    value: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
        }),
    ), // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    setSelectedItems: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    resource: null,
    actions: [],
    value: null,
    onChange: null,
    setSelectedItems: null,
    className: null,
};

const Actions = ({ resource, actions, value, onChange, setSelectedItems, className }) => {
    const actionsComponents = useActionsComponentsManager();

    const disabled = value === null || value.length === 0;
    const finalActions = useMemo(
        () =>
            (actions || []).map(
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
                    [className]: className !== null,
                },
            ])}
        >
            <div className="d-flex mt-1">
                {finalActions.map((action) => {
                    const { component = null } = action || {};
                    const Component = actionsComponents.getComponent(component);
                    return Component !== null ? (
                        <Component
                            {...action}
                            value={value}
                            resource={resource}
                            onChange={onChange}
                            setSelectedItems={setSelectedItems}
                            className="me-2"
                        />
                    ) : null;
                })}
            </div>
        </div>
    );
};

Actions.propTypes = propTypes;
Actions.defaultProps = defaultProps;

export default Actions;
