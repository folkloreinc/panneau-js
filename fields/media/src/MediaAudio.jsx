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
    durationLabel: PanneauPropTypes.message,
    sizeLabel: PanneauPropTypes.message,
    thumbnailPath: PropTypes.string,
    durationPath: PropTypes.string,
    sizePath: PropTypes.string,
};

const defaultProps = {
    durationLabel: messages.duration,
    sizeLabel: messages.size,
    thumbnailPath: 'thumbnails.0.url',
    durationPath: 'duration_human',
    sizePath: 'original_file.size_human',
};

const MediaAudio = ({
    intl, durationLabel, sizeLabel, durationPath, sizePath, ...props
}) => (
    <Card
        className={styles.audio}
        getDetails={(media) => {
            const duration = get(media, durationPath, null);
            const size = get(media, sizePath, null);
            const details = {};
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

MediaAudio.propTypes = propTypes;
MediaAudio.defaultProps = defaultProps;

export default injectIntl(MediaAudio);
