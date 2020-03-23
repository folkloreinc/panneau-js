import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

import styles from './styles/list-actions.scss';

const messages = defineMessages({
    show: {
        id: 'list.actions.show',
        description: 'The label of the show button',
        defaultMessage: 'Show',
    },
    edit: {
        id: 'list.actions.edit',
        description: 'The label of the edit button',
        defaultMessage: 'Edit',
    },
    delete: {
        id: 'list.actions.delete',
        description: 'The label of the delete button',
        defaultMessage: 'Delete',
    },
});

const propTypes = {
    intl: PanneauPropTypes.intl.isRequired,
    item: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    withoutLabel: PropTypes.bool,
    withIcons: PropTypes.bool,
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PanneauPropTypes.label.isRequired,
            icon: PropTypes.string.isRequired,
            link: PropTypes.string,
            linkItemPath: PropTypes.string,
            target: PropTypes.string,
            className: PropTypes.string,
            onClick: PropTypes.func,
        }),
    ),
};

const defaultProps = {
    className: null,
    withoutLabel: false,
    withIcons: false,
    actions: [
        {
            id: 'show',
            label: messages.show,
            className: 'btn-outline-secondary',
            icon: 'fas fa-eye',
        },
        {
            id: 'edit',
            label: messages.edit,
            className: 'btn-outline-primary',
            icon: 'fas fa-edit',
        },
        {
            id: 'delete',
            label: messages.delete,
            className: 'btn-outline-danger',
            icon: 'fas fa-trash',
        },
    ],
};

// @TODO: Use ButtonGroup core component
const ListActions = ({
    intl, item, onClick, className, actions, withoutLabel, withIcons,
}) => (
    <div
        className={classNames({
            'btn-group': true,
            'btn-group-sm': true,
            [styles.container]: true,
            [className]: className !== null,
        })}
    >
        {actions.map((action) => {
            const { label: buttonLabel, id: name } = action;
            const { id } = item;

            const linkItemPath = action.linkItemPath || null;
            // prettier-ignore
            const link = action.link || (
                linkItemPath !== null ? get(item, linkItemPath, null) : null
            );
            const isLink = link !== null;
            const key = `btn_action_${name}_${id}`;
            const label = isObject(buttonLabel) && typeof buttonLabel.id !== 'undefined' ? (
                <FormattedMessage {...buttonLabel} />
            ) : (
                buttonLabel
            );

            const buttonOnClick = action.onClick || null;
            const buttonClassName = action.className || null;
            const iconClassName = action.icon || null;
            const buttonClassNames = classNames({
                // 'btn-outline-secondary': true,
                btn: true,
                [buttonClassName]: buttonClassName !== null,
                [iconClassName]: iconClassName !== null && withoutLabel,
            });

            let title = null;
            if (isObject(buttonLabel) && typeof buttonLabel.id !== 'undefined') {
                title = intl.formatMessage(buttonLabel);
            } else if (isString(buttonLabel)) {
                title = buttonLabel;
            }

            const buttonProps = {
                key,
                className: buttonClassNames,
                onClick: (e) => {
                    if (buttonOnClick !== null) {
                        buttonOnClick(e, action, item);
                    } else if (!isLink && onClick !== null) {
                        onClick(e, action, item);
                    }
                },
                title,
            };
            if (isLink) {
                const linkTarget = action.target || null;
                buttonProps.href = link;
                if (linkTarget !== null) {
                    buttonProps.target = linkTarget;
                }
            }

            const ButtonComponent = isLink ? 'a' : 'button';
            return (
                <ButtonComponent {...buttonProps}>
                    {iconClassName !== null && !withoutLabel && withIcons ? (
                        <span
                            className={classNames({
                                [iconClassName]: true,
                                [styles.icon]: true,
                            })}
                            aria-hidden="true"
                        />
                    ) : null}
                    {!withoutLabel ? label : null}
                </ButtonComponent>
            );
        })}
    </div>
);

ListActions.propTypes = propTypes;
ListActions.defaultProps = defaultProps;

const WithIntlContainer = injectIntl(ListActions);
WithIntlContainer.getDefaultActions = () => defaultProps.actions;
export default WithIntlContainer;
