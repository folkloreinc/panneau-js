import classNames from 'classnames';

import type { AudioMedia, Media, VideoMedia } from '@panneau/core';

import Audio, { AudioProps } from './Audio';
import Video, { VideoProps } from './Video';

import styles from './styles.module.css';

function isVideoMedia(media: Media): media is VideoMedia {
    return media.type === 'video';
}

function isAudioMedia(media: Media): media is AudioMedia {
    return media.type === 'audio';
}

interface MediaPlayerProps extends Omit<VideoProps, 'media'>, Omit<AudioProps, 'media'> {
    // Any media can be passed, only video and audio medias are rendered
    value?: Media | null;
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
    return (
        <div
            className={classNames([styles.container, 'border', 'p-2', className])}
            style={{ width, height }}
        >
            {value !== null && isVideoMedia(value) ? <Video media={value} {...props} /> : null}
            {value !== null && isAudioMedia(value) ? <Audio media={value} {...props} /> : null}
        </div>
    );
}

export default MediaPlayer;
