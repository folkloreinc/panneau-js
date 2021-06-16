/* eslint-disable react/jsx-props-no-spreading */
import TextField from '@panneau/field-text';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

const getScheme = (url, schemesPattern) => {
    const match = url !== null && isString(url) ? url.match(schemesPattern) : null;
    return match !== null && match[1].length !== url.length ? match[1].toLowerCase() : null;
};

const removeScheme = (url, schemesPattern) =>
    url !== null && isString(url) ? url.replace(schemesPattern, '') : null;

const withScheme = (url, prefix, schemesPattern) =>
    url !== null && isString(url) && !url.match(schemesPattern) ? `${prefix}${url}` : url;

const propTypes = {
    value: PropTypes.string,
    schemes: PropTypes.arrayOf(PropTypes.string),
    url: PropTypes.string,
    metadata: PropTypes.shape({
        provider_name: PropTypes.string,
    }),
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    schemes: ['http://', 'https://', 'ftp://'],
    url: null,
    metadata: null,
    disabled: null,
    className: null,
    onChange: null,
};

const EmbedField = ({ value, schemes, url, disabled, className, onChange, ...props }) => {
    const schemesPattern = useMemo(() => new RegExp(`^(${schemes.join('|')})`, 'i'), [schemes]);

    const scheme = useMemo(
        () => getScheme(value, schemesPattern) || schemes[0],
        [value, schemes, schemesPattern],
    );

    const valueWithoutScheme = useMemo(
        () => removeScheme(value, schemesPattern),
        [value, schemesPattern],
    );

    const onFieldChange = useCallback(
        (newValue) => {
            const valueWithScheme = !isEmpty(newValue)
                ? withScheme(newValue, scheme, schemesPattern)
                : null;
            if (onChange !== null) {
                onChange(valueWithScheme);
            }
        },
        [onChange, scheme, schemesPattern],
    );

    return (
        <TextField
            {...props}
            className={className}
            value={valueWithoutScheme}
            onChange={onFieldChange}
            prepend={url || scheme}
            disabled={disabled}
            type="text"
        />
    );
};

EmbedField.propTypes = propTypes;
EmbedField.defaultProps = defaultProps;

export default EmbedField;
