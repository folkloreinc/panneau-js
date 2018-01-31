import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
// import { FormattedMessage } from 'react-intl';

const propTypes = {
    item: PropTypes.shape({}).isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    actions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string,
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
            label: 'list.action.show',
        },
        {
            id: 'edit',
            label: 'list.action.edit',
            className: 'btn-primary',
        },
        {
            id: 'delete',
            label: 'list.action.delete',
            className: 'btn-danger',
            icon: 'remove',
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
                        { icon && renderButtonIcon(icon) }
                        <FormattedMessage
                            id={label}
                        />
                    </button>
                );
            })
        }
    </div>
);

ListActions.propTypes = propTypes;
ListActions.defaultProps = defaultProps;

export default ListActions;
