/* eslint-disable react/jsx-no-useless-fragment */
import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { formatDuration } from '@panneau/core/utils';

const propTypes = {
    format: PropTypes.string,
    suffix: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const defaultProps = {
    format: null,
    suffix: null,
    value: null,
};

const Unit = ({ format, value, suffix }) => {
    const finalValue = useMemo(() => {
        if (value === null) {
            return null;
        }
        if (format === 'bytes') {
            return prettyBytes(parseInt(value, 10));
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
    }, [value]);
    return <span className="text-nowrap">{finalValue}</span>;
};

Unit.propTypes = propTypes;
Unit.defaultProps = defaultProps;

export default Unit;
