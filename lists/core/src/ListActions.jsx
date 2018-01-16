import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';

const propTypes = {
    item: PropTypes.shape({}).isRequired,
    onClick: PropTypes.func.isRequired, // e, action, index
    className: PropTypes.string,
    actions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string,
        icon: PropTypes.string,
        className: PropTypes.string,
        onClick: PropTypes.func, // e seulement
    })),
};

const defaultProps = {
    className: null,
    actions: [
        {
            id: 'show',
        },
        {
            id: 'edit',
        },
        {
            id: 'delete',
        },
    ],
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
                const { onClick: actionOnClick, id: action } = it;
                const { id } = item;

                const key = `btn_action_${action}_${id}`;

                const buttonClassName = get(it, 'className', null);
                const buttonClassNames = classNames({
                    [buttonClassName]: buttonClassName !== null,
                });
                const buttonOnClick = (e) => {
                    if (actionOnClick) {
                        actionOnClick(e);
                    } else {
                        onClick(e, it, id);
                    }
                };

                return (
                    <button
                        key={key}
                        className={buttonClassNames}
                        onClick={buttonOnClick}
                    />
                );
            })
        }
    </div>
);

ListActions.propTypes = propTypes;
ListActions.defaultProps = defaultProps;

export default ListActions;
