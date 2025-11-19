/* eslint-disable react/jsx-props-no-spreading */
import isEmpty from 'lodash-es/isEmpty';
import isNumber from 'lodash-es/isNumber';
import isObject from 'lodash-es/isObject';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import Card from '@panneau/element-card';
import UrlField from '@panneau/field-url';

interface EmbedMetadata {
    title?: string | null;
    providerName?: string | null;
    authorName?: string | null;
    thumbnailUrl?: string | null;
    description?: string | null;
    duration?: number | null;
    width?: number | null;
    height?: number | null;
}

interface EmbedValue {
    url?: string | null;
    metadata?: EmbedMetadata | null;
}

interface EmbedFieldProps {
    value?: string | EmbedValue | null;
    schemes?: string[];
    url?: string | null;
    disabled?: boolean | null;
    className?: string | null;
    onChange?: ((value: EmbedValue | null) => void) | null;
    [key: string]: unknown;
}

const DEFAULT_SCHEMES = ['http://', 'https://', 'ftp://'];

function EmbedField({
    value = null,
    schemes = DEFAULT_SCHEMES,
    url: prefixUrl = null,
    disabled = null,
    className = null,
    onChange = null,
    ...props
}: EmbedFieldProps) {
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
        (newValue: string | null) => {
            if (onChange !== null) {
                onChange({ url: newValue, metadata: null });
            }
        },
        [onChange],
    );

    const onClose = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }
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
}

export default EmbedField;
