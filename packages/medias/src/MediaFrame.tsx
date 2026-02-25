/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import { useCallback, useState } from 'react';

import type { Media } from '@panneau/core';
import ImageDisplay from '@panneau/display-image';
import MediaPlayer from '@panneau/element-media-player';

import styles from './styles.module.css';

interface MediaFrameProps {
    value?: Media | null;
    showPlayer?: boolean;
    className?: string | null;
}

function MediaFrame({
    value = null,
    showPlayer: initialShowPlayer = true,
    className = null,
}: MediaFrameProps) {
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
                    onClick={type === 'video' || type === 'audio' ? onClick : null}
                />
            )}
        </div>
    );
}

export default MediaFrame;
