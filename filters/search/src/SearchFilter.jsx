/* eslint-disable react/jsx-props-no-spreading */
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { KEYCODES, useKeyboardKeys } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import Icon from '@panneau/element-icon';
import TextField from '@panneau/field-text';

const messages = defineMessages({
    search: {
        defaultMessage: 'Search',
        description: 'Filter label',
    },
});

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    position: PropTypes.string,
    width: PropTypes.number,
    delay: PropTypes.number,
    className: PropTypes.string,
};

const defaultProps = {
    name: 'q',
    value: null,
    placeholder: null,
    position: null,
    width: null,
    delay: 500,
    className: null,
};

const SearchFilter = ({
    name,
    value,
    onChange,
    placeholder,
    position,
    width,
    delay,
    className,
}) => {
    const intl = useIntl();
    const [searchValue, setSearchValue] = useState(value);

    const onValueChange = useCallback(
        (newValue) => {
            setSearchValue(newValue !== '' ? newValue : null);
        },
        [setSearchValue],
    );

    const onSubmit = useCallback(
        (e) => {
            e.preventDefault();
            if (onChange !== null) {
                onChange(searchValue);
            }
        },
        [searchValue, onChange],
    );

    const onReset = useCallback(() => {
        if (onChange !== null) {
            setSearchValue(null);
            if (delay === null) {
                onChange(null);
            }
        }
    }, [onChange, delay, setSearchValue]);

    useEffect(() => {
        let timeout = null;
        if (delay !== null) {
            timeout = setTimeout(() => {
                onChange(searchValue);
            }, delay);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [searchValue, onChange, delay]);

    useEffect(() => {
        onValueChange(value);
    }, [value, onValueChange]);

    const active = !isEmpty(value);
    const canClear = !isEmpty(searchValue);

    useKeyboardKeys({
        [KEYCODES.ESCAPE]: onReset,
    });

    return (
        <form className={className} onSubmit={onSubmit}>
            <div className="input-group ">
                {position === 'left' ? (
                    <Button
                        theme={active ? 'primary' : 'secondary'}
                        type="submit"
                        onClick={onSubmit}
                        style={{ zIndex: 0 }}
                    >
                        <Icon name="search" bold />
                    </Button>
                ) : null}
                <TextField
                    type="search"
                    name={name}
                    value={searchValue}
                    theme="light"
                    onChange={onValueChange}
                    placeholder={placeholder || intl.formatMessage(messages.search)}
                    style={{
                        width: width !== null ? width - 42 : null,
                    }}
                />
                {canClear ? (
                    <Button
                        type="button"
                        onClick={onReset}
                        className="position-absolute top-0 me-0 border-0"
                        outline={false}
                        style={{
                            zIndex: 10,
                            right: position !== 'left' ? `40px` : 0,
                        }}
                    >
                        <Icon name="x-circle" />
                    </Button>
                ) : null}
                {position !== 'left' ? (
                    <Button
                        theme={active ? 'primary' : 'secondary'}
                        type="submit"
                        onClick={onSubmit}
                        style={{ zIndex: 0 }}
                    >
                        <Icon name="search" bold />
                    </Button>
                ) : null}
            </div>
        </form>
    );
};

SearchFilter.propTypes = propTypes;
SearchFilter.defaultProps = defaultProps;

export default SearchFilter;
