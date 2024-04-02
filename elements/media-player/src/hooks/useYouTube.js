import { useRef, useCallback, useEffect, useState } from 'react';
import { loadYouTube } from '@folklore/services';
import createDebug from 'debug';

const getYoutubeVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : false;
};

const debug = createDebug('video:youtube');

export const isVideoId = (url) => url !== null && url.match(/^https?:/) === null;

const getVideoId = (url) => {
    if (url === null) {
        return null;
    }
    if (isVideoId(url)) {
        return url;
    }
    return getYoutubeVideoId(url);
};

const noPlayerError = new Error('No player');

const useYouTube = (
    url,
    {
        videoId: initialVideoId = null,
        width = 0,
        height = 0,
        duration = 0,
        autoplay = false,
        controls = 0,
        muted: initialMuted = false,
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
    const iframeRef = useRef(null);
    const playerRef = useRef(null);
    const playerIframeRef = useRef(iframeRef.current);

    const [apiReady, setApiReady] = useState(typeof window.YT !== 'undefined');
    const videoId = initialVideoId || getVideoId(url);

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
    const lastVideoId = useRef(videoId);
    const videoIdChanged = lastVideoId.current !== videoId;
    if (videoIdChanged) {
        realCurrentTime.current = 0;
        lastVideoId.current = videoId;
    }

    const play = useCallback(() => {
        const { current: player } = playerRef;
        return player !== null && typeof player.playVideo !== 'undefined'
            ? Promise.resolve(player.playVideo())
            : Promise.reject(noPlayerError);
    }, []);

    const pause = useCallback(() => {
        const { current: player } = playerRef;
        return player !== null && typeof player.pauseVideo !== 'undefined'
            ? Promise.resolve(player.pauseVideo())
            : Promise.reject(noPlayerError);
    }, []);

    const setVolume = useCallback(
        (volume) => {
            const { current: player } = playerRef;
            const promise =
                player !== null && typeof player.setVolume !== 'undefined'
                    ? Promise.resolve(player.setVolume(volume * 100))
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
            player !== null && typeof player.mute !== 'undefined'
                ? Promise.resolve(player.mute())
                : Promise.reject(noPlayerError)
        ).then(() => setMuted(true));
    }, [setMuted]);

    const unmute = useCallback(() => {
        const { current: player } = playerRef;
        return (
            player !== null && typeof player.unMute !== 'undefined'
                ? Promise.resolve(player.unMute())
                : Promise.reject(noPlayerError)
        ).then(() => setMuted(false));
    }, []);

    const seek = useCallback((time) => {
        const { current: player } = playerRef;
        return player !== null && typeof player.seekTo !== 'undefined'
            ? Promise.resolve(player.seekTo(time))
            : Promise.reject(noPlayerError);
    }, []);

    const setLoop = useCallback((loop) => {
        const { current: player } = playerRef;
        return player !== null && typeof player.setLoop !== 'undefined'
            ? Promise.resolve(player.setLoop(loop))
            : Promise.reject(noPlayerError);
    }, []);

    const destroyPlayer = useCallback(() => {
        if (playerRef.current !== null) {
            debug('Unset player');
            playerRef.current = null;
        }
    }, []);

    useEffect(() => {
        let canceled = false;
        if (!apiReady && videoId !== null) {
            loadYouTube().then(() => {
                if (!canceled) {
                    setApiReady(true);
                }
            });
        }
        return () => {
            canceled = true;
        };
    }, [apiReady, videoId, setApiReady]);

    // Detect iframe switch and destroy player

    useEffect(() => {
        const { current: currentPlayer } = playerRef;
        if (playerIframeRef.current !== iframeRef.current && currentPlayer !== null) {
            debug('iFrame switched');
            destroyPlayer();
        }
    });

    // Create player
    useEffect(() => {
        const { current: currentPlayer } = playerRef;
        if (videoId === null || !apiReady) {
            destroyPlayer();
            return () => {};
        }
        let player = currentPlayer;

        if (player === null && iframeRef.current !== null) {
            debug('Create player [ID: %s]', videoId);
            const { current: iframe } = iframeRef;

            const onReady = ({ target }) => {
                player = target;
                playerRef.current = target;
                setReady(true);
                const newDuration = target.getDuration();
                if (newDuration !== metadata.duration) {
                    setMetadata({
                        ...metadata,
                        duration: newDuration,
                    });
                }

                // if (initialMuted) {
                //     target.mute();
                // }
                //
                // if (autoplay) {
                //     target.playVideo();
                // }

                debug('onReady [ID: %s]', videoId);
            };

            const onStateChange = ({ target, data: state }) => {
                const newState = {
                    playing: state === window.YT.PlayerState.PLAYING,
                    paused: state === window.YT.PlayerState.PAUSED,
                    ended: state === window.YT.PlayerState.ENDED,
                    buffering: state === window.YT.PlayerState.BUFFERING,
                };
                setPlayState(newState);
                let stateLabel = null;
                if (newState.playing) {
                    stateLabel = 'playing';
                } else if (newState.paused) {
                    stateLabel = 'paused';
                } else if (newState.ended) {
                    stateLabel = 'ended';
                } else if (newState.buffering) {
                    stateLabel = 'buffering';
                } else if (state === -1) {
                    stateLabel = 'not started';
                } else if (state === 0) {
                    stateLabel = 'stopped';
                }
                const id =
                    typeof target.getVideoUrl !== 'undefined'
                        ? getVideoId(target.getVideoUrl())
                        : videoId;
                debug('onStateChange %s [ID: %s]', stateLabel, id);
            };

            player = new window.YT.Player(iframe, {
                videoId,
                playerVars: {
                    controls,
                    autoplay: autoplay ? 1 : 0,
                    mute: initialMuted,
                    playsinline: true,
                    rel: 0,
                    showinfo: 0,
                    modestbranding: 1,
                },
                events: {
                    onReady,
                    onStateChange,
                },
            });
            playerIframeRef.current = iframe;
        } else {
            debug('Switch video [ID: %s]', videoId);
            player.loadVideoById(videoId);
        }

        playerRef.current = player;
    }, [apiReady, videoId, setPlayState, setReady, setMetadata, destroyPlayer]);

    const { playing, paused, buffering, ended } = playState;
    useEffect(() => {
        if (ready && videoId !== null && customOnLoaded !== null) {
            customOnLoaded();
        }
    }, [videoId, ready, customOnLoaded]);

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
        ref: iframeRef,
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

export default useYouTube;
