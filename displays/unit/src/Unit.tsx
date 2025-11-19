/* eslint-disable react/jsx-no-useless-fragment */
import isObject from 'lodash-es/isObject';
import prettyBytes from 'pretty-bytes';
import React, { useMemo } from 'react';

import { formatDuration } from '@panneau/core/utils';

interface UnitProps {
    value?: string | number | Record<string, unknown> | null;
    placeholder?: React.ReactNode | null;
    format?: string | null;
    suffix?: string | null;
}

function Unit({ value = null, placeholder = null, format = null, suffix = null }: UnitProps) {
    const finalValue = useMemo(() => {
        if (value === null) {
            return null;
        }
        if (format === 'bytes' && !isObject(value)) {
            return prettyBytes(parseInt(value as string, 10));
        }
        if (format === 'dimensions') {
            const { width = null, height = null, depth = null } = value || {};
            const finalWidth = width !== null && width > 0 ? width : null;
            const finalHeight = height !== null && height > 0 ? height : null;
            const finalDepth = depth !== null && depth > 0 ? depth : null;
            const finalSuffix = suffix !== null ? suffix : '';
            return `${finalWidth !== null ? `${finalWidth}${finalSuffix}` : ''}${
                finalHeight !== null ? ` x ${finalHeight}${finalSuffix}` : ''
            }${finalDepth !== null ? ` x ${finalDepth}${finalSuffix}` : ''}`;
        }
        if (format === 'duration') {
            return formatDuration(value);
        }
        return value;
    }, [value, format, suffix]);
    return <span className="text-nowrap">{finalValue || placeholder}</span>;
}

export default Unit;
