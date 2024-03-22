/* eslint-disable react/jsx-props-no-spreading */
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

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
    className: PropTypes.string,
};

const defaultProps = {
    name: 'q',
    value: null,
    placeholder: null,
    position: null,
    className: null,
};

const SearchFilter = ({ name, value, onChange, position, placeholder, className }) => {
    const intl = useIntl();
    const [searchValue, setSearchValue] = useState(value);

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
            onChange(null);
        }
    }, [onChange, setSearchValue]);

    useEffect(() => {
        setSearchValue(value);
    }, [value, setSearchValue]);

    const active = !isEmpty(value);
    const canClear = !isEmpty(searchValue);

    return (
        <form className={className} onSubmit={onSubmit}>
            <div className="input-group">
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
                    onChange={setSearchValue}
                    placeholder={placeholder || intl.formatMessage(messages.search)}
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
                        <Icon name="x-circle" opaque />
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
