import React from 'react';
import PropTypes from 'prop-types';
import isString from 'lodash/isString';
import get from 'lodash/get';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { Card } from '@panneau/field';
import { injectIntl } from 'react-intl';

import messages from './messages';

import styles from './styles.scss';

const propTypes = {
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
    dimensionLabel: PanneauPropTypes.message,
    durationLabel: PanneauPropTypes.message,
    sizeLabel: PanneauPropTypes.message,
    dimensionPath: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    thumbnailPath: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    durationPath: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    sizePath: PropTypes.string,
};

const defaultProps = {
    dimensionLabel: messages.dimension,
    durationLabel: messages.duration,
    sizeLabel: messages.size,
    dimensionPath: 'dimension_human',
    thumbnailPath: ['thumbnail', 'thumbnails.0.url'],
    durationPath: 'duration_human',
    sizePath: 'original_file.size_human',
};

const VideoCard = ({
    intl, dimensionLabel, durationLabel, sizeLabel, dimensionPath, durationPath, sizePath, ...props
}) => (
    <Card
        className={styles.video}
        getDetails={(media) => {
            const dimension = get(media, dimensionPath, null);
            const duration = get(media, durationPath, null);
            const size = get(media, sizePath, null);
            const details = {};
            if (dimension !== null) {
                details[
                    isString(dimensionLabel) ? dimensionLabel : intl.formatMessage(dimensionLabel)
                ] = dimension;
            }
            if (duration !== null) {
                details[
                    isString(durationLabel) ? durationLabel : intl.formatMessage(durationLabel)
                ] = duration;
            }
            if (size !== null) {
                details[isString(sizeLabel) ? sizeLabel : intl.formatMessage(sizeLabel)] = size;
            }
            return details;
        }}
        {...props}
    />
);

VideoCard.propTypes = propTypes;
VideoCard.defaultProps = defaultProps;

export default injectIntl(VideoCard);
