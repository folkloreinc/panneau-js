import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import { defineMessages } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ButtonGroup } from '@panneau/core/components';

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
            icon: 'fas fa-eye',
        },
        {
            id: 'edit',
            label: messages.edit,
            style: 'outline-primary',
            icon: 'fas fa-edit',
        },
        {
            id: 'delete',
            label: messages.delete,
            style: 'outline-danger',
            icon: 'fas fa-trash',
        },
    ],
};

const ListActions = ({ item, onClick, className, actions, withoutLabel, withIcons }) => (
    <ButtonGroup
        size="sm"
        className={classNames([
            styles.container,
            {
                [className]: className !== null,
            },
        ])}
        buttons={actions.map(action => {
            const {
                label,
                style,
                id,
                linkItemPath = null,
                link,
                icon,
                onClick: buttonOnClick = null,
                target = null,
            } = action;
            return {
                id,
                label: !withoutLabel ? label : null,
                icon: withIcons || withoutLabel ? icon : null,
                title: label,
                style,
                href: link || (linkItemPath !== null ? get(item, linkItemPath, null) : null),
                target,
                onClick: e => {
                    if (buttonOnClick !== null) {
                        buttonOnClick(e, action, item);
                    } else if (link !== null && onClick !== null) {
                        onClick(e, action, item);
                    }
                },
            };
        })}
    />
);

ListActions.propTypes = propTypes;
ListActions.defaultProps = defaultProps;
ListActions.getDefaultActions = () => defaultProps.actions;

export default ListActions;
