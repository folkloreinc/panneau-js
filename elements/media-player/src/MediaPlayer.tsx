import classNames from 'classnames';

import { AudioMedia, VideoMedia } from '@panneau/core';

import Audio, { AudioProps } from './Audio';
import Video, { VideoProps } from './Video';

import styles from './styles.module.css';

type PlayableMedia = VideoMedia | AudioMedia;

interface MediaPlayerProps extends Omit<VideoProps, 'media'>, Omit<AudioProps, 'media'> {
    value?: PlayableMedia | null;
    width?: number | string | null;
    height?: number | string | null;
    className?: string | null;
}

function MediaPlayer({
    value = null,
    width = null,
    height = null,
    className = null,
    ...props
}: MediaPlayerProps) {
    const { type = null } = value || {};
    return (
        <div
            className={classNames([styles.container, 'border', 'p-2', className])}
            style={{ width, height }}
        >
            {type === 'video' ? <Video media={value} {...props} /> : null}
            {type === 'audio' ? <Audio media={value} {...props} /> : null}
        </div>
    );
}

export default MediaPlayer;
