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

    const realCurrentTime = useRef(currentTime);

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
            const promise =
                player !== null && typeof player.volume !== 'undefined'
                    ? Promise.resolve(() => {
                          player.volume = volume * 100;
                      })
                    : Promise.reject(noPlayerError);
            if (customOnVolumeChange) {
                customOnVolumeChange(volume);
            }
            return promise;
        },
        [customOnVolumeChange],
    );

    const mute = useCallback(() => {
        const { current: player } = playerRef;
        return (
            player !== null && typeof player.volume !== 'undefined'
                ? Promise.resolve(() => {
                      player.volume = 0;
                  })
                : Promise.reject(noPlayerError)
        ).then(() => setMuted(true));
    }, [setMuted]);

    const unmute = useCallback(() => {
        const { current: player } = playerRef;
        return (
            player !== null && typeof player.volume !== 'undefined'
                ? Promise.resolve(() => {
                      player.volume = 1;
                  })
                : Promise.reject(noPlayerError)
        ).then(() => setMuted(false));
    }, []);

    const seek = useCallback((time) => {
        const { current: player } = playerRef;
        return player !== null && typeof player.currentTime !== 'undefined'
            ? Promise.resolve(() => {
                  player.currentTime = time;
              })
            : Promise.reject(noPlayerError);
    }, []);

    const setLoop = useCallback((loop) => {
        const { current: player } = playerRef;
        return player !== null && typeof player.loop !== 'undefined'
            ? Promise.resolve(() => {
                  player.loop = loop;
              })
            : Promise.reject(noPlayerError);
    }, []);

    const destroyPlayer = useCallback(() => {
        const { current: player } = playerRef;
        if (player !== null) {
            debug('Unset player');
            playerRef.current = null;
        }
    }, []);

    // Create player
    useEffect(() => {}, [setPlayState, setReady, setMetadata, destroyPlayer]);

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
        if (muted && playerRef.current !== null) {
            playerRef.current.muted = muted;
            playerRef.current.defaultMuted = muted;
        }
    }, [muted, playerRef.current]);

    useEffect(() => {
        if (autoplay && playerRef.current !== null) {
            playerRef.current.play();
        }
    }, [autoplay, playerRef.current]);

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

    // Check time update
    useEffect(() => {
        const { current: player } = playerRef;
        if (player === null) {
            return () => {};
        }
        const onTimeUpdate = () => {
            const seconds = player.getCurrentTime();
            realCurrentTime.current = seconds;
            setCurrentTime(seconds);

            if (customOnTimeUpdate !== null) {
                customOnTimeUpdate(seconds);
            }
        };
        let interval = null;
        if (playing) {
            interval = setInterval(onTimeUpdate, 1000);
        }
        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
        };
    }, [setCurrentTime, playing]);

    return {
        ref: playerRef,
        play,
        pause,
        mute,
        unmute,
        setVolume,
        seek,
        setLoop,
        ready,
        currentTime: realCurrentTime.current,
        muted,
        loaded: ready,
        ...metadata,
        ...playState,
    };
};

export default useNativeVideo;
