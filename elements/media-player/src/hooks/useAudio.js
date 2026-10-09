// import { loadYouTube } from '@folklore/services';
import createDebug from 'debug';
import { useCallback, useEffect, useRef, useState } from 'react';

const debug = createDebug('video:native');

const noPlayerError = new Error('No player');

const useNativeVideo = (
    url,
    {
        autoplay = true,
        width = 0,
        height = 0,
        duration = 0,
        initialMuted = true,
        onLoaded: customOnLoaded = null,
        onPlay: customOnPlay = null,
        onPause: customOnPause = null,
        onEnd: customOnEnd = null,
        onMetadataChange: customOnMetadataChange = null,
        onVolumeChange: customOnVolumeChange = null,
        onBufferStart: customOnBufferStart = null,
        onBufferEnded: customOnBufferEnded = null,
        onTimeUpdate: customOnTimeUpdate = null,
    } = {},
) => {
    const playerRef = useRef(null);
    // Keep the element in state so effects re-run when it changes (refs can't be read during render)
    const [playerElement, setPlayerElement] = useState(null);
    const ref = useCallback(
        (element) => {
            playerRef.current = element;
            setPlayerElement(element);
        },
        [setPlayerElement],
    );

    const [ready, setReady] = useState(false);
    const [muted, setMuted] = useState(initialMuted);
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

    const play = useCallback(() => {
        const { current: player } = playerRef;
        return player !== null && typeof player.play !== 'undefined'
            ? Promise.resolve(player.play())
            : Promise.reject(noPlayerError);
    }, []);

    const pause = useCallback(() => {
        const { current: player } = playerRef;
        return player !== null && typeof player.pause !== 'undefined'
            ? Promise.resolve(player.pause())
            : Promise.reject(noPlayerError);
    }, []);

    const setVolume = useCallback(
        (volume) => {
            const { current: player } = playerRef;
            if (player === null || typeof player.volume === 'undefined') {
                return Promise.reject(noPlayerError);
            }
            // HTMLMediaElement volume is between 0 and 1
            player.volume = Math.min(Math.max(volume, 0), 1);
            if (customOnVolumeChange) {
                customOnVolumeChange(volume);
            }
            return Promise.resolve();
        },
        [customOnVolumeChange],
    );

    const mute = useCallback(() => {
        const { current: player } = playerRef;
        if (player === null || typeof player.muted === 'undefined') {
            return Promise.reject(noPlayerError);
        }
        player.muted = true;
        setMuted(true);
        return Promise.resolve();
    }, [setMuted]);

    const unmute = useCallback(() => {
        const { current: player } = playerRef;
        if (player === null || typeof player.muted === 'undefined') {
            return Promise.reject(noPlayerError);
        }
        player.muted = false;
        setMuted(false);
        return Promise.resolve();
    }, [setMuted]);

    const seek = useCallback((time) => {
        const { current: player } = playerRef;
        if (player === null || typeof player.currentTime === 'undefined') {
            return Promise.reject(noPlayerError);
        }
        player.currentTime = time;
        return Promise.resolve();
    }, []);

    const setLoop = useCallback((loop) => {
        const { current: player } = playerRef;
        if (player === null || typeof player.loop === 'undefined') {
            return Promise.reject(noPlayerError);
        }
        player.loop = loop;
        return Promise.resolve();
    }, []);

    // Bind media events
    useEffect(() => {
        const { current: player } = playerRef;
        if (url === null || player === null || typeof player.addEventListener === 'undefined') {
            return () => {};
        }
        debug('Bind events [URL: %s]', url);
        setReady(player.readyState >= 1);

        const onLoadedMetadata = () => {
            setMetadata({
                width: player.videoWidth || width,
                height: player.videoHeight || height,
                duration: player.duration || duration,
            });
            setReady(true);
        };
        const onPlay = () =>
            setPlayState({
                playing: true,
                paused: false,
                ended: false,
                buffering: false,
            });
        const onPause = () =>
            setPlayState({
                playing: false,
                paused: true,
                ended: false,
                buffering: false,
            });
        const onEnded = () =>
            setPlayState({
                playing: false,
                paused: false,
                ended: true,
                buffering: false,
            });
        const onWaiting = () =>
            setPlayState((state) => ({
                ...state,
                buffering: true,
            }));
        const onPlaying = () =>
            setPlayState({
                playing: true,
                paused: false,
                ended: false,
                buffering: false,
            });
        const onVolumeChange = () => setMuted(player.muted);
        const onTimeUpdate = () => {
            const seconds = player.currentTime;
            setCurrentTime(seconds);
            if (customOnTimeUpdate !== null) {
                customOnTimeUpdate(seconds);
            }
        };

        player.addEventListener('loadedmetadata', onLoadedMetadata);
        player.addEventListener('play', onPlay);
        player.addEventListener('pause', onPause);
        player.addEventListener('ended', onEnded);
        player.addEventListener('waiting', onWaiting);
        player.addEventListener('playing', onPlaying);
        player.addEventListener('volumechange', onVolumeChange);
        player.addEventListener('timeupdate', onTimeUpdate);

        return () => {
            debug('Unbind events [URL: %s]', url);
            player.removeEventListener('loadedmetadata', onLoadedMetadata);
            player.removeEventListener('play', onPlay);
            player.removeEventListener('pause', onPause);
            player.removeEventListener('ended', onEnded);
            player.removeEventListener('waiting', onWaiting);
            player.removeEventListener('playing', onPlaying);
            player.removeEventListener('volumechange', onVolumeChange);
            player.removeEventListener('timeupdate', onTimeUpdate);
        };
    }, [
        url,
        width,
        height,
        duration,
        customOnTimeUpdate,
        setPlayState,
        setReady,
        setMetadata,
        setMuted,
        setCurrentTime,
    ]);

    const { playing, paused, buffering, ended } = playState;

    useEffect(() => {
        if (ready && customOnLoaded !== null) {
            customOnLoaded();
        }
    }, [ready, customOnLoaded]);

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

    useEffect(() => {
        const { current: player } = playerRef;
        if (muted && player !== null) {
            player.muted = muted;
            player.defaultMuted = muted;
        }
    }, [muted, playerElement]);

    useEffect(() => {
        const { current: player } = playerRef;
        if (autoplay && player !== null) {
            Promise.resolve(player.play()).catch((e) => {
                debug('Autoplay error: %o', e);
            });
        }
    }, [autoplay, playerElement]);

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
        ref,
        play,
        pause,
        mute,
        unmute,
        setVolume,
        seek,
        setLoop,
        ready,
        currentTime,
        muted,
        loaded: ready,
        ...metadata,
        ...playState,
    };
};

export default useNativeVideo;
