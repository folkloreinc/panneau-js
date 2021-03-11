/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';

import { PropTypes as MicromagPropTypes } from '../../lib';

const propTypes = {
    fonts: MicromagPropTypes.fonts,
    formats: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                name: PropTypes.string,
                format: PropTypes.string,
            }),
        ]),
    ),
};

const defaultProps = {
    fonts: [],
    formats: [
        'eot',
        'woff2',
        'woff',
        {
            name: 'otf',
            format: 'opentype',
        },
        {
            name: 'ttf',
            format: 'truetype',
        },
        'svg',
    ],
};

const FontFaces = ({ fonts, formats }) => {
    const fontFaces = (fonts || [])
        .filter((it) => isObject(it) && it.type === 'custom' && (it.media || null) !== null)
        .map(({ name = null, media = null }) => {
            const { files = {} } = media || {};
            const urls = formats.reduce((currentUrls, format) => {
                const finalFormat = isObject(format) ? format.format : format;
                const formatExtension = isObject(format) ? format.name : format;
                const file = files[`webfonts.${formatExtension}`] || files[formatExtension] || null;
                return file !== null
                    ? [...currentUrls, `url("${file.url}?") format("${finalFormat}")`]
                    : currentUrls;
            }, []);
            return urls.length > 0 && name !== null
                ? `
                @font-face {
                    font-family: "${name}";
                    src: ${urls.join(',')};
                }
            `
                : null;
        })
        .filter((it) => it !== null);
    return fontFaces.length > 0 ? <style type="text/css">{fontFaces.join('\n')}</style> : null;
};

FontFaces.propTypes = propTypes;
FontFaces.defaultProps = defaultProps;

export default FontFaces;
