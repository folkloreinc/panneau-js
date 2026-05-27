import classNames from 'classnames';

import { AudioMedia } from '@panneau/core';

import styles from './styles.module.css';

export interface AudioProps {
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    media?: AudioMedia | null;
    width?: number | string | null;
    height?: number | string | null;
    withoutControls?: boolean;
    className?: string | null;
    audioClassName?: string | null;
}

function Audio({
    autoPlay = false,
    muted = false,
    loop = true,
    media = null,
    width = null,
    height = null,
    withoutControls = false,
    className = null,
    audioClassName = null,
}: AudioProps) {
    const {
        url = null,
        thumbnail_url: thumbnail = null,
        thumbnailUrl = null,
        provider: videoProvider = null,
    } = media || {};

    const finalThumbnailUrl = thumbnail || thumbnailUrl || null;

    return (
        <div
            className={classNames([
                styles.audioContainer,
                {
                    [styles.isNative]: videoProvider === null,
                },
                className,
            ])}
            style={{
                backgroundImage:
                    finalThumbnailUrl !== null ? `url(${finalThumbnailUrl})` : undefined,
            }}
        >
            {url !== null ? (
                <audio
                    key={media !== null ? `video-${url}` : 'video'}
                    className={classNames([styles.audio, audioClassName])}
                    src={url}
                    style={{ width: width || undefined, height: height || undefined }}
                    controls={!withoutControls}
                    loop={loop}
                    autoPlay={autoPlay}
                    muted={muted}
                />
            ) : null}
        </div>
    );
}

export default Audio;
