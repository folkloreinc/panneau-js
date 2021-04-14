/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import TextField from '@panneau/field-text';

const getScheme = (url, schemesPattern) => {
    const match = url !== null ? url.match(schemesPattern) : null;
    return match !== null && match[1].length !== url.length ? match[1].toLowerCase() : null;
};

const removeScheme = (url, schemesPattern) =>
    url !== null ? url.replace(schemesPattern, '') : null;

const withScheme = (url, prefix, schemesPattern) =>
    url !== null && !url.match(schemesPattern) ? `${prefix}${url}` : url;

const propTypes = {
    value: PropTypes.string,
    schemes: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    schemes: ['http://', 'https://', 'ftp://'],
    className: null,
    onChange: null,
};

const UrlField = ({ schemes, value, className, onChange, ...props }) => {
    const schemesPattern = useMemo(() => new RegExp(`^(${schemes.join('|')})`, 'i'), [schemes]);

    const scheme = useMemo(() => getScheme(value, schemesPattern) || schemes[0], [
        value,
        schemes,
        schemesPattern,
    ]);
    const valueWithoutScheme = useMemo(() => removeScheme(value, schemesPattern), [
        value,
        schemesPattern,
    ]);

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
            prepend={scheme}
        />
    );
};

UrlField.propTypes = propTypes;
UrlField.defaultProps = defaultProps;

export default UrlField;
