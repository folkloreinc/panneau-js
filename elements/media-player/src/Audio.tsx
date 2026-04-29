/* eslint-disable jsx-a11y/media-has-caption */
import classNames from 'classnames';
import type { RefObject } from 'react';
import { forwardRef, useRef } from 'react';

import styles from './styles.module.css';

interface Media {
    url?: string | null;
    thumbnail_url?: string | null;
    thumbnailUrl?: string | null;
    provider?: string | null;
}

interface AudioProps {
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    media?: Media | null;
    width?: number | null;
    height?: number | null;
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

    const el = useRef<HTMLDivElement>(null);
    const finalThumbnailUrl = thumbnail || thumbnailUrl || null;

    return (
        <div
            ref={el}
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
                    src={url !== null ? url : undefined}
                    type="audio/mp3"
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

export default ({ ref, ...props }: AudioProps & { ref?: RefObject<any | null> }) => (
    <Audio {...props} />
);
