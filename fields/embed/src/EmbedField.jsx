/* eslint-disable react/jsx-props-no-spreading */
import Card from '@panneau/element-card';
import TextField from '@panneau/field-text';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

const getScheme = (url, schemesPattern) => {
    const match = url !== null && isString(url) ? url.match(schemesPattern) : null;
    return match !== null && match[1].length !== url.length ? match[1].toLowerCase() : null;
};

const removeScheme = (url, schemesPattern) =>
    url !== null && isString(url) ? url.replace(schemesPattern, '') : null;

const withScheme = (url, prefix, schemesPattern) =>
    url !== null && isString(url) && !url.match(schemesPattern) ? `${prefix}${url}` : url;

const propTypes = {
    value: PropTypes.shape({
        url: PropTypes.string,
        metadata: PropTypes.shape({
            title: PropTypes.string,
            providerName: PropTypes.string,
            authorName: PropTypes.string,
            thumbnailUrl: PropTypes.string,
            description: PropTypes.string,
            duration: PropTypes.number,
            width: PropTypes.number,
            height: PropTypes.number,
        }),
    }),
    schemes: PropTypes.arrayOf(PropTypes.string),
    url: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    schemes: ['http://', 'https://', 'ftp://'],
    url: null,
    disabled: null,
    className: null,
    onChange: null,
};

const EmbedField = ({
    value,
    schemes,
    url: prefixUrl,
    disabled,
    className,
    onChange,
    ...props
}) => {
    const { url = null, metadata = null } = isObject(value) ? value : {};
    const {
        title = null,
        providerName = null,
        authorName = null,
        thumbnailUrl = null,
        description = null,
        duration = null,
        width = null,
        height = null,
    } = metadata || {};

    const schemesPattern = useMemo(() => new RegExp(`^(${schemes.join('|')})`, 'i'), [schemes]);

    const scheme = useMemo(
        () => getScheme(url, schemesPattern) || schemes[0],
        [url, schemes, schemesPattern],
    );

    const valueWithoutScheme = useMemo(
        () => removeScheme(url, schemesPattern),
        [url, schemesPattern],
    );

    const onFieldChange = useCallback(
        (newValue) => {
            const valueWithScheme = !isEmpty(newValue)
                ? withScheme(newValue, scheme, schemesPattern)
                : null;
            if (onChange !== null) {
                onChange({ url: valueWithScheme, metadata: null });
            }
        },
        [onChange, scheme, schemesPattern],
    );

    const onClose = useCallback(() => {
        onChange(null);
    }, [onChange]);

    const dateDuration = isNumber(duration)
        ? new Date(duration * 1000).toISOString().substr(11, 8)
        : null;

    return metadata !== null ? (
        <Card title={title} subtitle={providerName} image={thumbnailUrl} onClose={onClose}>
            <div className="my-3">
                {!isEmpty(authorName) ? <p className="fw-bold lh-1 mb-1">{authorName}</p> : null}
                {!isEmpty(description) ? <p className="lh-1 mb-1">{description}</p> : null}
                {!isEmpty(url) ? (
                    <p className="lh-1 mb-3">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            {url}
                        </a>
                    </p>
                ) : null}
                {dateDuration !== null ? (
                    <p className="lh-1 mb-1">
                        <FormattedMessage
                            defaultMessage="Duration:"
                            description="Field description"
                        />{' '}
                        {dateDuration}
                    </p>
                ) : null}
                {width !== null && height !== null ? (
                    <p className="lh-1 mb-1">
                        {width}x{height}
                    </p>
                ) : null}
            </div>
        </Card>
    ) : (
        <TextField
            {...props}
            className={className}
            value={valueWithoutScheme}
            onChange={onFieldChange}
            prepend={prefixUrl || scheme}
            disabled={disabled}
            type="text"
        />
    );
};

EmbedField.propTypes = propTypes;
EmbedField.defaultProps = defaultProps;

export default EmbedField;
