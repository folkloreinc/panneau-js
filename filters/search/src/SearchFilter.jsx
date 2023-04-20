/* eslint-disable react/jsx-props-no-spreading */
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import Button from '@panneau/element-button';
import Icon from '@panneau/element-icon';
import TextField from '@panneau/field-text';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    name: 'q',
    value: null,
    placeholder: 'Search...',
    className: null,
};

const SearchFilter = ({ name, value, onChange, placeholder, className }) => {
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

    return (
        <form className={className} onSubmit={onSubmit}>
            <div className="input-group">
                <Button theme="secondary" type="submit" onClick={onSubmit}>
                    <Icon name="search" bold />
                </Button>
                <TextField
                    type="search"
                    name={name}
                    value={searchValue}
                    theme="light"
                    onChange={setSearchValue}
                    placeholder={placeholder}
                />
                {!isEmpty(searchValue) ? (
                    <Button
                        type="button"
                        onClick={onReset}
                        className="position-absolute top-0 end-0 me-0 border-0"
                        outline={false}
                        style={{
                            zIndex: 10,
                        }}
                    >
                        <Icon name="x-circle" />
                    </Button>
                ) : null}
            </div>
        </form>
    );
};

SearchFilter.propTypes = propTypes;
SearchFilter.defaultProps = defaultProps;

export default SearchFilter;
