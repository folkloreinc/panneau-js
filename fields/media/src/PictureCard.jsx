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
    sizeLabel: PanneauPropTypes.message,
    thumbnailPath: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    dimensionPath: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    sizePath: PropTypes.string,
};

const defaultProps = {
    dimensionLabel: messages.dimension,
    sizeLabel: messages.size,
    thumbnailPath: ['thumbnail', 'url'],
    dimensionPath: 'dimension',
    sizePath: 'original_file.size_human',
};

const PictureCard = ({
    intl, dimensionLabel, sizeLabel, dimensionPath, sizePath, ...props
}) => (
    <Card
        className={styles.picture}
        getDetails={(media) => {
            const dimension = get(media, dimensionPath, null);
            const size = get(media, sizePath, null);
            const details = {};
            if (dimension !== null) {
                details[
                    isString(dimensionLabel) ? dimensionLabel : intl.formatMessage(dimensionLabel)
                ] = dimension;
            }
            if (size !== null) {
                details[isString(sizeLabel) ? sizeLabel : intl.formatMessage(sizeLabel)] = size;
            }
            return details;
        }}
        {...props}
    />
);

PictureCard.propTypes = propTypes;
PictureCard.defaultProps = defaultProps;

export default injectIntl(PictureCard);
