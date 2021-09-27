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
    disabled: PropTypes.bool,
    prepend: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    schemes: ['http://', 'https://', 'ftp://', 'tel:', 'mailto:'],
    url: null,
    disabled: null,
    prepend: null,
    className: null,
    onChange: null,
};

const UrlField = ({ value, schemes, url, disabled, prepend, className, onChange, ...props }) => {
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
            prepend={prepend || url || scheme}
            disabled={disabled}
            type="text"
        />
    );
};

UrlField.propTypes = propTypes;
UrlField.defaultProps = defaultProps;

export default UrlField;
