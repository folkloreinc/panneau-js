import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import isString from 'lodash/isString';
import { FormattedMessage, defineMessages } from 'react-intl';

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
    item: PropTypes.shape({}).isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    iconsOnly: PropTypes.bool,
    showIcons: PropTypes.bool,
    actions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                id: PropTypes.string,
                description: PropTypes.string,
                defaultMessage: PropTypes.string,
            }),
        ]),
        icon: PropTypes.string,
        className: PropTypes.string,
        onClick: PropTypes.func,
    })),
};

const defaultProps = {
    className: null,
    iconsOnly: false,
    showIcons: false,
    actions: [
        {
            id: 'show',
            label: messages.show,
            icon: 'fas fa-eye',
        },
        {
            id: 'edit',
            label: messages.edit,
            className: 'btn-primary',
            icon: 'fas fa-edit',
        },
        {
            id: 'delete',
            label: messages.delete,
            className: 'btn-danger',
            icon: 'fas fa-trash',
        },
    ],
};

const renderButtonIcon = (icon) => {
    const iconClassNames = classNames({
        glyphicon: true,
        [`glyphicon-${icon}`]: true,
    });

    return (
        <span
            className={iconClassNames}
            aria-hidden="true"
        />
    );
};

const ListActions = ({
    item,
    onClick,
    className,
    actions,
    iconsOnly,
    showIcons,
}) => (
    <div
        className={classNames({
            'btn-group': true,
            [styles.container]: true,
            [className]: className !== null,
        })}
    >
        {
            actions.map((it) => {
                // @TODO cleanup the constant names ?
                const {
                    label: actionLabel,
                    icon,
                    onClick: actionOnClick,
                    id: action,
                } = it;
                const { id } = item;

                const key = `btn_action_${action}_${id}`;
                const label = isString(actionLabel) ? actionLabel : (
                    <FormattedMessage {...actionLabel} />
                );

                const buttonClassName = get(it, 'className', null);
                const iconClassName = get(it, 'icon', null);
                const buttonClassNames = classNames({
                    btn: true,
                    'btn-outline-secondary': true,
                    [buttonClassName]: buttonClassName !== null,
                    [iconClassName]: iconClassName !== null && iconsOnly,
                });
                const buttonOnClick = (e) => {
                    if (actionOnClick) {
                        actionOnClick(e);
                    } else {
                        onClick(e, it);
                    }
                };

                return (
                    <button
                        key={key}
                        className={buttonClassNames}
                        onClick={buttonOnClick}
                    >
                        {icon !== null && !iconsOnly && showIcons ? renderButtonIcon(icon) : null}
                        {!iconsOnly ? label : null}
                    </button>
                );
            })
        }
    </div>
);

ListActions.propTypes = propTypes;
ListActions.defaultProps = defaultProps;

export default ListActions;
