import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import isString from 'lodash/isString';
import { FormattedMessage, defineMessages } from 'react-intl';

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
    actions: [
        {
            id: 'show',
            label: messages.show,
        },
        {
            id: 'edit',
            label: messages.edit,
            className: 'btn-primary',
        },
        {
            id: 'delete',
            label: messages.delete,
            className: 'btn-danger',
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
}) => (
    <div
        className={classNames({
            'btn-group': true,
            [className]: className !== null,
        })}
    >
        {
            actions.map((it) => {
                // @TODO cleanup the constant names ?
                const {
                    label,
                    icon,
                    onClick: actionOnClick,
                    id: action,
                } = it;
                const { id } = item;

                const key = `btn_action_${action}_${id}`;

                const buttonClassName = get(it, 'className', null);
                const buttonClassNames = classNames({
                    btn: true,
                    'btn-default': true,
                    [buttonClassName]: buttonClassName !== null,
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
                        {icon !== null ? renderButtonIcon(icon) : null}
                        {isString(label) ? label : (
                            <FormattedMessage {...label} />
                        )}
                    </button>
                );
            })
        }
    </div>
);

ListActions.propTypes = propTypes;
ListActions.defaultProps = defaultProps;

export default ListActions;
