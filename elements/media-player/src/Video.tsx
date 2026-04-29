/* eslint-disable jsx-a11y/media-has-caption */
import classNames from 'classnames';
import type { MutableRefObject, RefObject } from 'react';
import { forwardRef, useRef } from 'react';

import useVideo from './hooks/useVideo';

import styles from './styles.module.css';

interface Media {
    url?: string | null;
    iframeUrl?: string | null;
    provider?: string | null;
    id?: string;
    width?: number;
    height?: number;
    duration?: number;
    files?: {
        h264?: { url?: string | null };
        webm?: { url?: string | null };
    };
}

interface VideoProps {
    autoPlay?: boolean;
    loop?: boolean;
    initialMuted?: boolean;
    media?: Media | null;
    width?: number | null;
    height?: number | null;
    apiRef?: MutableRefObject<any> | null;
    withoutControls?: boolean;
    onPlay?: (() => void) | null;
    onPause?: (() => void) | null;
    onEnd?: (() => void) | null;
    onMetadataChange?: ((metadata: any) => void) | null;
    onVolumeChange?: ((volume: number) => void) | null;
    onBufferStart?: (() => void) | null;
    onBufferEnded?: (() => void) | null;
    onTimeUpdate?: ((time: number) => void) | null;
    onLoaded?: (() => void) | null;
    playsInline?: boolean | null;
    className?: string | null;
    iframeClassName?: string | null;
    videoClassName?: string | null;
}

function Video({
    autoPlay = true,
    loop = true,
    initialMuted = true,
    media = null,
    width = null,
    height = null,
    apiRef = null,
    withoutControls = false,
    onPlay = null,
    onPause = null,
    onEnd = null,
    onMetadataChange = null,
    onVolumeChange = null,
    onBufferStart = null,
    onBufferEnded = null,
    onTimeUpdate = null,
    onLoaded = null,
    playsInline = null,
    className = null,
    iframeClassName = null,
    videoClassName = null,
}: VideoProps) {
    const {
        url = null,
        iframeUrl = null,
        provider: videoProvider = null,
        id: videoId,
        width: videoWidth,
        height: videoHeight,
        duration: videoDuration,
    } = media || {};

    const lastVideoRef = useRef(media);
    if (lastVideoRef.current === null) {
        lastVideoRef.current = media;
    } else {
        lastVideoRef.current = media;
    }

    const { files = null } = lastVideoRef.current || {};
    const { h264 = null, webm = null } = files || {};
    const { url: h264Url = null } = h264 || {};
    const { url: webmUrl = null } = webm || {};

    const finalUrl = h264Url || webmUrl || iframeUrl || url;

    const { ref, ...api } = useVideo(finalUrl, {
        autoplay: autoPlay,
        controls: 0,
        type: videoProvider,
        videoId,
        initialMuted,
        width: videoWidth,
        height: videoHeight,
        duration: videoDuration,
        onEnd,
        onMetadataChange,
        onPlay,
        onPause,
        onBufferStart,
        onBufferEnded,
        onTimeUpdate,
        onVolumeChange,
        onLoaded,
    });

    if (apiRef !== null) {
        apiRef.current = api;
    }

    const { muted, playing, buffering, loaded } = api;

    const loading = finalUrl !== null && (!loaded || buffering);
    const paused = !playing && !loading && loaded;

    const el = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={el}
            className={classNames([
                styles.videoContainer,
                {
                    [styles.paused]: paused,
                    [styles.loading]: loading,
                    [styles.muted]: muted,
                    [styles.isNative]: videoProvider === null,
                },
                className,
            ])}
        >
            {url !== null ? (
                <div className={styles.inner}>
                    {videoProvider === 'youtube' || videoProvider === 'vimeo' ? (
                        <iframe
                            key={media !== null ? `video-${finalUrl}` : 'video'}
                            className={classNames([styles.iframe, iframeClassName])}
                            title="video"
                            frameBorder={0}
                            src={
                                lastVideoRef.current !== null
                                    ? lastVideoRef.current.iframeUrl ||
                                      lastVideoRef.current.url ||
                                      undefined
                                    : undefined
                            }
                            ref={ref}
                            allow="autoplay"
                            allowFullScreen
                            width={width || undefined}
                            height={height || undefined}
                        />
                    ) : null}
                    {videoProvider === null ? (
                        <video
                            key={media !== null ? `video-${url}` : 'video'}
                            className={classNames([styles.video, videoClassName])}
                            src={finalUrl || undefined}
                            type="video/mp4"
                            playsInline={playsInline || undefined}
                            ref={ref}
                            style={{ width: width || undefined, height: height || undefined }}
                            controls={!withoutControls}
                            loop={loop}
                        />
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

export default ({ ref, ...props }: VideoProps & { ref?: RefObject<any | null> }) => (
    <Video apiRef={ref} {...props} />
);
