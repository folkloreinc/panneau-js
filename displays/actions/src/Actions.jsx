/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Actions from '@panneau/action-actions';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useActions } from '@panneau/core/hooks';

const propTypes = {
    item: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }),
    ]).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    actions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string])),
    urlGenerator: PropTypes.func,
    actionsProps: PropTypes.shape({}),
    size: PanneauPropTypes.buttonSize,
    theme: PropTypes.string,
    outline: PropTypes.bool,
    className: PropTypes.string,
    buttonsClassName: PropTypes.string,
};

const DEFAULT_ACTIONS = ['show', 'edit', 'delete'];

const ActionsDisplay = ({
    item,
    value = null,
    placeholder = null,
    actions = DEFAULT_ACTIONS,
    urlGenerator: parentUrlGenerator = null,
    actionsProps = null,
    size = 'sm',
    theme = null,
    outline = null,
    className = null,
    buttonsClassName = null,
    ...props
}) => {
    const { urlGenerator, ...otherProps } = actionsProps || {};
    const finalActions = useActions(item, actions, parentUrlGenerator || urlGenerator, otherProps);
    return (
        <div
            className={classNames([
                {
                    [className]: className !== null,
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
};

ActionsDisplay.propTypes = propTypes;

export default ActionsDisplay;
