/* eslint-disable jsx-a11y/media-has-caption, react/jsx-props-no-spreading, no-param-reassign */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';

import useVideo from './hooks/useVideo';

import styles from './styles.module.scss';

const propTypes = {
    autoPlay: PropTypes.bool,
    loop: PropTypes.bool,
    initialMuted: PropTypes.bool,
    media: PropTypes.shape({}),
    width: PropTypes.number,
    height: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    apiRef: PropTypes.any,
    withoutControls: PropTypes.bool,
    onPlay: PropTypes.func,
    onPause: PropTypes.func,
    onEnd: PropTypes.func,
    onMetadataChange: PropTypes.func,
    onVolumeChange: PropTypes.func,
    onBufferStart: PropTypes.func,
    onBufferEnded: PropTypes.func,
    onTimeUpdate: PropTypes.func,
    onLoaded: PropTypes.func,
    playsInline: PropTypes.bool,
    className: PropTypes.string,
    iframeClassName: PropTypes.string,
    videoClassName: PropTypes.string,
};

const defaultProps = {
    autoPlay: true,
    loop: true,
    initialMuted: true,
    media: null,
    width: null,
    height: null,
    apiRef: null,
    withoutControls: false,
    onPlay: null,
    onPause: null,
    onEnd: null,
    onMetadataChange: null,
    onVolumeChange: null,
    onBufferStart: null,
    onBufferEnded: null,
    onTimeUpdate: null,
    onLoaded: null,
    playsInline: null,
    className: null,
    iframeClassName: null,
    videoClassName: null,
};

const Video = ({
    autoPlay,
    loop,
    initialMuted,
    media,
    width,
    height,
    apiRef,
    withoutControls,
    onPlay,
    onPause,
    onEnd,
    onMetadataChange,
    onVolumeChange,
    onBufferStart,
    onBufferEnded,
    onTimeUpdate,
    onLoaded,
    playsInline,
    className,
    iframeClassName,
    videoClassName,
}) => {
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
        // else if (video !== null && (lastVideoRef.current.type !== video.type || video.live || lastVideoRef.current.live)) {
        lastVideoRef.current = media;
    }

    const finalUrl = iframeUrl || url;

    const { ref, ...api } = useVideo(finalUrl, {
        autoplay: autoPlay,
        controls: 0, // !withoutControls,
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
        // console.log('ref update');
        apiRef.current = api;
    }

    const {
        muted,
        playing,
        buffering,
        loaded,
        // play = null,
        // pause = null,
        // // currentTime = 0,
        // // duration = 0,
        // seek = null,
    } = api;

    const loading = finalUrl !== null && (!loaded || buffering);
    const paused = !playing && !loading && loaded;

    const el = useRef(null);

    // const onTogglePlay = useCallback(() => {
    //     if (playing) {
    //         if (pause !== null) {
    //             pause();
    //         }
    //     } else if (play !== null) {
    //         try {
    //             play();
    //         } catch (err) {
    //             console.log('play blocked', err);
    //         }
    //     }
    // }, [playing, play, pause]);

    // const onSeek = useCallback(
    //     (e) => {
    //         if (seek !== null) {
    //             seek(e);
    //         }
    //         if (play !== null) {
    //             try {
    //                 play();
    //             } catch (err) {
    //                 console.log('play blocked', err);
    //             }
    //         }
    //     },
    //     [seek, play],
    // );

    // console.log(muted, playing, buffering, loaded);

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
                    [className]: className !== null,
                },
            ])}
        >
            {url !== null ? (
                <div className={styles.inner}>
                    {videoProvider === 'youtube' || videoProvider === 'vimeo' ? (
                        <iframe
                            key={media !== null ? `video-${finalUrl}` : 'video'}
                            className={classNames([
                                styles.iframe,
                                { [iframeClassName]: iframeClassName !== null },
                            ])}
                            title="video"
                            frameBorder={0}
                            src={
                                lastVideoRef.current !== null
                                    ? lastVideoRef.current.iframeUrl || lastVideoRef.current.url
                                    : null
                            }
                            ref={ref}
                            allow="autoplay"
                            allowFullScreen
                            width={width}
                            height={height}
                        />
                    ) : null}
                    {videoProvider === null ? (
                        <video
                            key={media !== null ? `video-${url}` : 'video'}
                            className={classNames([
                                styles.video,
                                { [videoClassName]: videoClassName !== null },
                            ])}
                            src={lastVideoRef.current !== null ? lastVideoRef.current.url : null}
                            type="video/mp4"
                            playsInline={playsInline}
                            ref={ref}
                            style={{ width, height }}
                            controls={!withoutControls}
                            loop={loop}
                        />
                    ) : null}
                </div>
            ) : null}
        </div>
    );
};

Video.propTypes = propTypes;
Video.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => <Video apiRef={ref} {...props} />);
