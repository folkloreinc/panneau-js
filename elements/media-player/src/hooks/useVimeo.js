import Player from '@vimeo/player';
import createDebug from 'debug';
import { useCallback, useEffect, useRef, useState } from 'react';

const debug = createDebug('video:vimeo');

export const isVideoId = (url) => url !== null && url.match(/^[0-9]+$/);

const getVideoId = (url) => {
    if (url === null) {
        return null;
    }
    if (isVideoId(url)) {
        return url;
    }
    const match = url.match(/\/[0-9]+/);
    return match !== null ? match[1] : null;
};

const noPlayerError = new Error('No player');

const useVimeo = (
    url,
    {
        videoId: initialVideoId = null,
        width = 0,
        height = 0,
        duration = 0,
        autoplay = false,
        autopause = true,
        byline = false,
        controls = false,
        initialMuted = false,
        onPlay: customOnPlay = null,
        onPause: customOnPause = null,
        onEnd: customOnEnd = null,
        onMetadataChange: customOnMetadataChange = null,
        onVolumeChange: customOnVolumeChange = null,
        onBufferStart: customOnBufferStart = null,
        onBufferEnded: customOnBufferEnded = null,
        onTimeUpdate: customOnTimeUpdate = null,
        onLoaded: customOnLoaded = null,
    } = {},
) => {
    const iframeRef = useRef(null);
    const playerRef = useRef(null);

    const videoId = initialVideoId || getVideoId(url);
    const [ready, setReady] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [volume, setVolumeState] = useState(initialMuted ? 0 : 1);
    const [currentTime, setCurrentTime] = useState(0);
    const [playState, setPlayState] = useState({
        playing: false,
        paused: false,
        ended: false,
        buffering: false,
    });

    const [metadata, setMetadata] = useState({
        width,
        height,
        duration,
    });

    const realCurrentTime = useRef(currentTime);
    const lastVideoId = useRef(videoId);
    const videoIdChanged = lastVideoId.current !== videoId;
    if (videoIdChanged) {
        realCurrentTime.current = 0;
        lastVideoId.current = videoId;
    }

    const play = useCallback(() => {
        const { current: player } = playerRef;
        return player !== null ? player.play() : Promise.reject(noPlayerError);
    }, []);

    const pause = useCallback(() => {
        const { current: player } = playerRef;
        return player !== null ? player.pause() : Promise.reject(noPlayerError);
    }, []);

    const setVolume = useCallback((newVolume) => {
        const { current: player } = playerRef;
        return player !== null ? player.setVolume(newVolume) : Promise.reject(noPlayerError);
    }, []);

    const mute = useCallback(() => {
        const { current: player } = playerRef;
        return player !== null ? player.setVolume(0) : Promise.reject(noPlayerError);
    }, []);

    const unmute = useCallback(() => {
        const { current: player } = playerRef;
        return player !== null ? player.setVolume(1) : Promise.reject(noPlayerError);
    }, []);

    const seek = useCallback((time) => {
        const { current: player } = playerRef;
        return player !== null ? player.setCurrentTime(time) : Promise.reject(noPlayerError);
    }, []);

    const setLoop = useCallback((loop) => {
        const { current: player } = playerRef;
        return player !== null ? player.setLoop(loop) : Promise.reject(noPlayerError);
    }, []);

    const destroyVideo = useCallback(() => {
        const { current: player } = playerRef;
        if (player !== null) {
            debug('Unload video');
            player.unload();
        }
        if (player !== null) {
            debug('Unset video');
            playerRef.current = null;
        }
    }, []);

    const playerIframeRef = useRef(iframeRef.current);
    useEffect(() => {
        const { current: currentPlayer } = playerRef;
        if (playerIframeRef.current !== iframeRef.current && currentPlayer !== null) {
            debug('iFrame switched');
            destroyVideo();
        }
    });

    // Create player
    useEffect(() => {
        const { current: currentPlayer } = playerRef;
        if (videoId === null) {
            destroyVideo();
            return () => {};
        }
        let canceled = false;

        let player = currentPlayer;
        if (player === null) {
            debug('Create player [ID: %s]', videoId);
            const { current: iframe } = iframeRef;

            player = new Player(iframe, {
                id: videoId,
                autoplay,
                autopause,
                byline,
                controls,
                muted: initialMuted,
                background: !controls,
            });
            player
                .ready()
                .then(() => setReady(true))
                .catch((e) => {
                    debug('ERROR: %o', e);
                });
            playerIframeRef.current = iframe;
        } else {
            debug('Load video [ID: %s]', videoId);
            player.loadVideo(videoId).catch((e) => {
                debug('ERROR: %o', e);
            });
        }

        const onLoaded = () => {
            Promise.all([
                player.getDuration(),
                player.getVideoWidth(),
                player.getVideoHeight(),
                player.getMuted(),
            ]).then(([newDuration, newWidth, newHeight, newMuted]) => {
                const newMetadata = {
                    duration: newDuration,
                    width: newWidth,
                    height: newHeight,
                };
                setMetadata(newMetadata);
                if (newMuted) {
                    setVolumeState(0);
                }
                setLoaded(true);
            });
            debug('onLoaded [ID: %s]', videoId);
        };
        const onPlay = () => {
            setPlayState({
                playing: true,
                paused: false,
                ended: false,
                buffering: false,
            });
            debug('onPlay [ID: %s]', videoId);
            player
                .getMuted()
                .then((newMuted) => {
                    if (!canceled && newMuted) {
                        setVolumeState(0);
                    }
                })
                .catch(() => {});
        };
        const onPause = () => {
            setPlayState({
                playing: false,
                paused: true,
                ended: false,
                buffering: false,
            });
            debug('onPause [ID: %s]', videoId);
        };
        const onTimeUpdate = ({ seconds }) => {
            realCurrentTime.current = seconds;
            setCurrentTime(seconds);

            if (customOnTimeUpdate !== null) {
                customOnTimeUpdate(seconds);
            }
        };
        const onVolumeChange = ({ volume: newVolume }) => setVolumeState(newVolume);
        const onEnded = () =>
            setPlayState({
                playing: false,
                paused: false,
                ended: true,
                buffering: false,
            });
        const onBufferStart = () => {
            setPlayState({
                playing: true,
                paused: false,
                ended: false,
                buffering: true,
            });
            debug('onBufferStart [ID: %s]', videoId);
        };
        const onBufferEnded = () => {
            setPlayState({
                playing: true,
                paused: false,
                ended: false,
                buffering: false,
            });
            debug('onBufferStart [ID: %s]', videoId);
        };

        debug('Bind events [ID: %s]', videoId);
        player.on('loaded', onLoaded);
        player.on('play', onPlay);
        player.on('pause', onPause);
        player.on('timeupdate', onTimeUpdate);
        player.on('volumechange', onVolumeChange);
        player.on('ended', onEnded);
        player.on('bufferstart', onBufferStart);
        player.on('bufferend', onBufferEnded);

        playerRef.current = player;

        return () => {
            canceled = true;
            debug('Unbind events [ID: %s]', videoId);
            player.off('loaded', onLoaded);
            player.off('play', onPlay);
            player.off('pause', onPause);
            player.off('timeupdate', onTimeUpdate);
            player.off('volumechange', onVolumeChange);
            player.off('ended', onEnded);
            player.off('bufferstart', onBufferStart);
            player.off('bufferend', onBufferEnded);
        };
    }, [
        videoId,
        setReady,
        setPlayState,
        setMetadata,
        setVolumeState,
        destroyVideo,
        setLoaded,
        setCurrentTime,
    ]);

    const { playing, paused, buffering, ended } = playState;

    useEffect(() => {
        if (loaded && customOnLoaded !== null) {
            customOnLoaded();
        }
    }, [loaded, customOnLoaded]);

    useEffect(() => {
        if (customOnVolumeChange !== null) {
            customOnVolumeChange(volume);
        }
    }, [volume, customOnVolumeChange]);

    useEffect(() => {
        if (playing && customOnPlay !== null) {
            customOnPlay();
        }
    }, [playing, customOnPlay]);

    useEffect(() => {
        if (paused && customOnPause !== null) {
            customOnPause();
        }
    }, [paused, customOnPause]);

    useEffect(() => {
        if (buffering && customOnBufferStart !== null) {
            customOnBufferStart();
        } else if (!buffering && customOnBufferEnded !== null) {
            customOnBufferEnded();
        }
    }, [buffering, customOnBufferStart, customOnBufferEnded]);

    useEffect(() => {
        if (ended && customOnEnd !== null) {
            customOnEnd();
        }
    }, [ended, customOnEnd]);

    const { width: metaWidth, height: metaHeight, duration: metaDuration } = metadata;
    useEffect(() => {
        if (metadata && customOnMetadataChange !== null) {
            customOnMetadataChange({
                width: metaWidth,
                height: metaHeight,
                duration: metaDuration,
            });
        }
    }, [metaWidth, metaHeight, metaDuration, customOnMetadataChange]);

    return {
        ref: iframeRef,
        play,
        pause,
        mute,
        unmute,
        setVolume,
        seek,
        setLoop,
        ready,
        buffering,
        currentTime: realCurrentTime.current,
        loaded,
        muted: volume === 0,
        ...metadata,
        ...playState,
    };
};

export default useVimeo;
