import { useCallback, useEffect, useRef, useState } from 'react';

const progressSteps = [0.1, 0.25, 0.5, 0.75, 0.9];

const useMediaApi = ({
    url = null,
    initialMuted = false,
    onTimeUpdate = null,
    onProgressStep = null,
    onDurationChanged = null,
    onVolumeChanged = null,
    onPlay = null,
    onPause = null,
    onEnded = null,
    onSeeked = null,
    onLoadStart = null,
    onCanPlayThough = null,
} = {}) => {
    const ref = useRef(null);
    const [muted, setMuted] = useState(initialMuted);
    const [currentTime, setCurrentTime] = useState(null);
    const [duration, setDuration] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [ready, setReady] = useState(false);
    const [initialPlay, setInitialPlay] = useState(true);
    const progressStepsReached = useRef({});

    const paused = !playing;

    // Exposed methods

    const play = useCallback(() => {
        const { current: media } = ref;
        if (media !== null) {
            media.play();
        }
    }, []);

    const pause = useCallback(() => {
        const { current: media } = ref;
        if (media !== null) {
            media.pause();
        }
    }, []);

    const togglePlay = useCallback(() => {
        const { current: media } = ref;
        if (media !== null) {
            if (playing) {
                media.pause();
            } else {
                media.play();
            }
        }
    }, [playing]);

    const stop = useCallback(() => {
        const { current: media } = ref;
        if (media !== null) {
            media.pause();
            media.currentTime = 0;
        }
    }, []);

    const seek = useCallback((time) => {
        const { current: media } = ref;
        if (media !== null) {
            media.currentTime = time;
        }
    }, []);

    const mute = useCallback(() => {
        const { current: media } = ref;
        if (media !== null) {
            media.muted = true;
        }
    }, []);

    const unMute = useCallback(() => {
        const { current: media } = ref;
        if (media !== null) {
            media.muted = false;
        }
    }, []);

    const toggleMute = useCallback(() => {
        const { current: media } = ref;
        if (media !== null) {
            media.muted = !muted;
        }
    }, [muted]);

    // Media events callbacks

    const onCustomPlay = useCallback(() => {
        if (onPlay !== null) {
            onPlay({ initial: initialPlay });
        }

        if (initialPlay) {
            setInitialPlay(false);
        }
        setPlaying(true);
    }, [initialPlay, setPlaying, onPlay]);

    const onCustomPause = useCallback(() => {
        const { current: media } = ref; 
        setPlaying(false);

        if (onPause !== null) {
            onPause({ midway: media.currentTime > 0 && media.currentTime < media.duration });
        }
    }, [setPlaying, onPause]);

    const onCustomEnded = useCallback(() => {
        const { current: media } = ref; 
        media.currentTime = 0;
        if (onEnded !== null) {
            onEnded();
        }
        setInitialPlay(true);
    }, [setInitialPlay, onEnded]);

    const onCustomTimeUpdate = useCallback(() => {
        const { current: media } = ref;

        setCurrentTime(media.currentTime);

        if (onTimeUpdate !== null) {
            onTimeUpdate(media.currentTime);
        }

        const progress = media.currentTime / media.duration;
        const currentSteps = progressStepsReached.current;
        const stepsToTrack = progressSteps.filter(
            (step) => progress > step && typeof currentSteps[step] === 'undefined',
        );
        stepsToTrack.forEach((step) => {
            if (onProgressStep !== null) {
                onProgressStep(step);
            }
            currentSteps[step] = true;
        });
    }, [setCurrentTime, onTimeUpdate, onProgressStep]);

    const onCustomDurationChange = useCallback(() => {
        const { current: media } = ref;

        setDuration(media.duration);

        if (onDurationChanged !== null) {
            onDurationChanged(media.duration);
        }
    }, [setDuration, onDurationChanged]);

    const onCustomSeeked = useCallback(() => {
        const { current: media } = ref;

        if (onSeeked !== null) {
            onSeeked(media.currentTime);
        }
    }, [onSeeked]);

    const onCustomVolumeChange = useCallback(() => {
        const { current: media } = ref;

        setMuted(media.muted);

        if (onVolumeChanged !== null) {
            onVolumeChanged(media.muted, media.volume);
        }
    }, [setMuted, onVolumeChanged]);

    const onCustomLoadStart = useCallback(() => {
        setReady(false);

        if (onLoadStart !== null) {
            onLoadStart();
        }
    }, [setReady, onLoadStart]);

    const onCustomCanPlayThrough = useCallback(() => {
        setReady(true);

        if (onCanPlayThough !== null) {
            onCanPlayThough();
        }
    }, [setReady, onCanPlayThough]);

    useEffect(() => {
        const { current: media } = ref;

        if (media !== null) {
            media.addEventListener('timeupdate', onCustomTimeUpdate);
            media.addEventListener('durationchange', onCustomDurationChange);
            media.addEventListener('volumechange', onCustomVolumeChange);
            media.addEventListener('play', onCustomPlay);
            media.addEventListener('pause', onCustomPause);
            media.addEventListener('ended', onCustomEnded);
            media.addEventListener('seeked', onCustomSeeked);
            media.addEventListener('loadstart', onCustomLoadStart);
            media.addEventListener('canplaythrough', onCustomCanPlayThrough);
        }

        return () => {            
            if (media !== null) {
                media.removeEventListener('timeupdate', onCustomTimeUpdate);
                media.removeEventListener('durationchange', onCustomDurationChange);
                media.removeEventListener('volumechange', onCustomVolumeChange);
                media.removeEventListener('play', onCustomPlay);
                media.removeEventListener('pause', onCustomPause);
                media.removeEventListener('ended', onCustomEnded);
                media.removeEventListener('seeked', onCustomSeeked);
                media.removeEventListener('loadstart', onCustomLoadStart);
                media.removeEventListener('canplaythrough', onCustomCanPlayThrough);
            }
        };
    }, [url]);

    return {
        ref,
        play,
        pause,
        togglePlay,
        stop,
        seek,
        mute,
        unMute,
        toggleMute,
        muted,
        currentTime,
        duration,
        playing,
        paused,
        ready,
    };
};

export default useMediaApi;
