/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import Button from '@panneau/element-button';
import MediaPlayer from '@panneau/element-media-player';
import MediaPreview from '@panneau/element-media-preview';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.shape({
        id: PropTypes.string,
        type: PropTypes.string,
    }),
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    className: null,
};

function MediaFrame({ value, className }) {
    const [showPlayer, setShowPlayer] = useState(false);
    const { type = null } = value || {};

    const onClick = useCallback(() => {
        setShowPlayer(!showPlayer);
    }, [showPlayer, setShowPlayer]);

    return (
        <div className={classNames([className, { [className]: className != null }])}>
            {showPlayer ? (
                <MediaPlayer value={value} />
            ) : (
                <MediaPreview value={value} width="100%" />
            )}
            <div className={styles.playButton}>
                {!showPlayer && (type === 'video' || type === 'embed') ? (
                    <Button
                        className="rounded-circle"
                        theme="secondary"
                        onClick={onClick}
                        icon="play-fill"
                    />
                ) : null}
            </div>
        </div>
    );
}

MediaFrame.propTypes = propTypes;
MediaFrame.defaultProps = defaultProps;

export default MediaFrame;
