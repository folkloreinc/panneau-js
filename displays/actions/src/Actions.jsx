/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Actions from '@panneau/action-actions';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useActions } from '@panneau/core/hooks';

import styles from './styles.module.scss';

const propTypes = {
    item: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    actions: PanneauPropTypes.buttons,
    urlGenerator: PropTypes.func,
    actionsProps: PropTypes.shape({}),
    size: PanneauPropTypes.buttonSize,
    theme: PropTypes.string,
    outline: PropTypes.bool,
    className: PropTypes.string,
    buttonsClassName: PropTypes.string,
};

const defaultProps = {
    value: null,
    placeholder: null,
    actions: ['show', 'edit', 'delete'],
    urlGenerator: null,
    actionsProps: null,
    size: 'sm',
    theme: null,
    outline: null,
    className: null,
    buttonsClassName: null,
};

const ActionsDisplay = ({
    item,
    value,
    placeholder,
    actions,
    urlGenerator: parentUrlGenerator,
    actionsProps,
    size,
    theme,
    outline,
    className,
    buttonsClassName,
    ...props
}) => {
    const { urlGenerator, ...otherProps } = actionsProps || {};
    const finalActions = useActions(item, actions, parentUrlGenerator || urlGenerator, otherProps);
    return (
        <div
            className={classNames([
                styles.container,
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
ActionsDisplay.defaultProps = defaultProps;

export default ActionsDisplay;
