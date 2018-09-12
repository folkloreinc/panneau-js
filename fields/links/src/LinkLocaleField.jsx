import React from 'react';
import PropTypes from 'prop-types';
import LocaleField from '@panneau/field-locale';

import LinkField from './LinkField';

const getValue = value => (value !== null
    ? Object.keys(value).reduce(
        (lastValue, key) => ({
            ...(value[key] !== null
                ? Object.keys(value[key]).reduce(
                    (currentValue, locale) => ({
                        ...currentValue,
                        [locale]: {
                            ...(lastValue[locale] || null),
                            [key]: value[key][locale],
                        },
                    }),
                    lastValue,
                )
                : null),
        }),
        {},
    )
    : value);

const setValue = value => (value !== null
    ? Object.keys(value).reduce(
        (lastValue, locale) => ({
            ...(value[locale] !== null
                ? Object.keys(value[locale]).reduce(
                    (currentValue, key) => ({
                        ...currentValue,
                        [key]: {
                            ...(lastValue[key] || null),
                            [locale]: value[locale][key],
                        },
                    }),
                    lastValue,
                )
                : null),
        }),
        {},
    )
    : value);

const propTypes = {
    value: PropTypes.shape({
        url: PropTypes.objectOf(PropTypes.string),
        label: PropTypes.objectOf(PropTypes.string),
    }),
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    onChange: null,
};

const LinkLocaleField = ({ value, onChange, ...props }) => (
    <LocaleField
        FieldComponent={LinkField}
        value={getValue(value)}
        onChange={(newValue) => {
            if (onChange !== null) {
                onChange(setValue(newValue));
            }
        }}
        {...props}
    />
);

LinkLocaleField.propTypes = propTypes;
LinkLocaleField.defaultProps = defaultProps;

export default LinkLocaleField;
