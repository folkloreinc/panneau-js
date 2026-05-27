import classNames from 'classnames';
import type { ForwardedRef } from 'react';
import { useImperativeHandle } from 'react';

import { VideoMedia } from '@panneau/core';

import useVideo from './hooks/useVideo';

import styles from './styles.module.css';

interface VideoMetadata {
    duration?: number;
    width?: number;
    height?: number;
}

export interface VideoApi {
    play: () => void;
    pause: () => void;
    seek?: (time: number) => void;
    setVolume?: (volume: number) => void;
    mute?: () => void;
    unmute?: () => void;
    playing: boolean;
    paused: boolean;
    ended: boolean;
    muted: boolean;
    buffering?: boolean;
    volume?: number;
    currentTime?: number;
    loaded?: boolean;
    ready?: boolean;
    duration?: number | null;
    width?: number | null;
    height?: number | null;
}

export interface VideoProps {
    autoPlay?: boolean;
    loop?: boolean;
    initialMuted?: boolean;
    media?: VideoMedia | null;
    width?: number | string | null;
    height?: number | string | null;
    apiRef?: ForwardedRef<VideoApi> | null;
    withoutControls?: boolean;
    onPlay?: (() => void) | null;
    onPause?: (() => void) | null;
    onEnd?: (() => void) | null;
    onMetadataChange?: ((metadata: VideoMetadata) => void) | null;
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
        files = null,
    } = media || {};

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

    useImperativeHandle(apiRef, () => api, [api]);

    const { muted, playing, buffering, loaded } = api;

    const loading = finalUrl !== null && (!loaded || buffering);
    const paused = !playing && !loading && loaded;

    return (
        <div
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
                            src={iframeUrl ?? url}
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

export default Video;
