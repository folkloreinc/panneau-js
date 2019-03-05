/* eslint-disable react/button-has-type */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import classNames from 'classnames';

import * as TablePropTypes from './PropTypes';
import Column from './Column';

const propTypes = {
    column: TablePropTypes.column.isRequired,
    item: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onClickButton: PropTypes.func,
};

const defaultProps = {
    item: null,
    onClickButton: null,
};

const ButtonsColumn = ({ column, onClickButton }) => {
    const { buttons = [] } = column;

    const divClassNames = classNames({
        [get(column, 'className', 'btn-group')]: true,
    });

    return (
        <Column align="right" {...column}>
            <div className={divClassNames}>
                {buttons.map((button, index) => {
                    const {
                        type = 'button',
                        className = 'btn btn-default',
                        label = null,
                        children = null,
                        leftIcon = null,
                        rightIcon = null,
                    } = button;
                    const onClick = e => onClickButton(e, button, index);

                    const key = `button_${index}`;

                    const inner = (
                        <Fragment>
                            {leftIcon !== null ? (
                                <span className={`glyphicon glyphicon-${leftIcon}`} />
                            ) : null}
                            {label}
                            {children}
                            {rightIcon !== null ? (
                                <span className={`glyphicon glyphicon-${button.rightIcon}`} />
                            ) : null}
                        </Fragment>
                    );

                    if (type === 'link') {
                        const href = get(button, 'href', '#').replace(/:[a-z][^/\s:]+/gi, (match) => {
                            const hrefKey = match.replace(/^:/, '');
                            const value = get(it, hrefKey, null);
                            return value !== null ? value : match;
                        });

                        return (
                            <a key={key} href={href} className={className} onClick={onClick}>
                                {inner}
                            </a>
                        );
                    }

                    return (
                        <button key={key} type={type} className={className} onClick={onClick}>
                            {inner}
                        </button>
                    );
                })}
            </div>
        </Column>
    );
};

ButtonsColumn.propTypes = propTypes;
ButtonsColumn.defaultProps = defaultProps;

export default ButtonsColumn;
