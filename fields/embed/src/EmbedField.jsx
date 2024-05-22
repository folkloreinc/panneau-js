/* eslint-disable react/jsx-props-no-spreading */
import isEmpty from 'lodash-es/isEmpty';
import isNumber from 'lodash-es/isNumber';
import isObject from 'lodash-es/isObject';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import Card from '@panneau/element-card';
import UrlField from '@panneau/field-url';

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
    const { url = null, metadata = null } = isObject(value) ? value : { url: value };
    const urlValue = url || null;
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

    const onFieldChange = useCallback(
        (newValue) => {
            if (onChange !== null) {
                onChange({ url: newValue, metadata: null });
            }
        },
        [onChange],
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
        <UrlField
            {...props}
            className={className}
            value={urlValue}
            onChange={onFieldChange}
            disabled={disabled}
        />
    );
};

EmbedField.propTypes = propTypes;
EmbedField.defaultProps = defaultProps;

export default EmbedField;
