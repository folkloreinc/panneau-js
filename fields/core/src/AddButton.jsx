/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import createClassName from 'classnames';
import isString from 'lodash/isString';
import { defineMessages, FormattedMessage } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

const messages = defineMessages({
    add: {
        id: 'fields.core.buttons.add',
        description: 'The label of the "add" button in items field',
        defaultMessage: 'Add',
    },
});

const propTypes = {
    dropdown: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.node,
    })),
    label: PanneauPropTypes.message,
    icon: PropTypes.string,
    onClick: PropTypes.func,
};

const defaultProps = {
    dropdown: null,
    label: messages.add,
    icon: null,
    onClick: null,
};

const AddButton = ({
    label, icon, dropdown, onClick, ...props
}) => {
    const buttonProps = {};
    if (dropdown && dropdown.length) {
        buttonProps['data-toggle'] = 'dropdown';
        buttonProps['aria-haspopup'] = 'true';
        buttonProps['aria-expanded'] = 'false';
    } else {
        buttonProps.onClick = onClick;
    }
    return (
        <div className="btn-group">
            <button
                type="button"
                className={createClassName({
                    btn: true,
                    'btn-primary': true,
                    'dropdown-toggle': dropdown !== null && dropdown.length,
                })}
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                {...buttonProps}
                {...props}
            >
                {icon ? <span className={icon} /> : null}
                {isString(label) ? label : (
                    <FormattedMessage {...label} />
                )}
                {dropdown && dropdown.length ? <span className="caret" /> : null}
            </button>
            {dropdown && dropdown.length ? (
                <ul className="dropdown-menu">
                    {dropdown.map((it, index) => (
                        <li key={`drop_${it.label}`}>
                            <a
                                href="#"
                                onClick={(e) => {
                                    onClick(e, it, index);
                                }}
                            >
                                {it.label}
                            </a>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
};

AddButton.propTypes = propTypes;
AddButton.defaultProps = defaultProps;

export default AddButton;
