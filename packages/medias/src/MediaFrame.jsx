/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import ImageDisplay from '@panneau/display-image';
import MediaPlayer from '@panneau/element-media-player';

import styles from './styles.module.css';

const propTypes = {
    value: PropTypes.shape({
        id: PropTypes.string,
        type: PropTypes.string,
    }),
    showPlayer: PropTypes.bool,
    className: PropTypes.string,
};

function MediaFrame({
    value = null,
    showPlayer: initialShowPlayer = true,
    className = null
})  {
    const [showPlayer, setShowPlayer] = useState(initialShowPlayer);
    const { type = null } = value || {};

    const onClick = useCallback(() => {
        setShowPlayer(!showPlayer);
    }, [showPlayer, setShowPlayer]);

    return (
        <div
            className={classNames([
                styles.mediaFrame,
                'position-relative',
                'd-flex',
                'flex-grow-1',
                'w-100',
                'mw-100',
                { [className]: className != null },
            ])}
        >
            {showPlayer && type !== 'image' ? (
                <MediaPlayer value={value} autoPlay={false} width="100%" />
            ) : (
                <ImageDisplay
                    className="w-100"
                    value={value}
                    maxWidth="100%"
                    maxHeight="100%"
                    onClick={type === 'video' || type === 'audio' ? onClick : null}
                />
            )}
        </div>
    );
}

MediaFrame.propTypes = propTypes;

export default MediaFrame;
