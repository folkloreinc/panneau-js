import { useEffect, useRef } from 'react';

interface UseAnimationFrameOptions {
    disabled?: boolean;
}

function useAnimationFrame(
    onFrame: (progress: number) => void,
    { disabled = false }: UseAnimationFrameOptions = {},
): void {
    const requestRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const onFrameRef = useRef(onFrame);

    // Always call the latest onFrame from the running loop
    useEffect(() => {
        onFrameRef.current = onFrame;
    }, [onFrame]);

    useEffect(() => {
        if (disabled) {
            return () => {};
        }
        startTimeRef.current = null;
        const callback = (time: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = time;
            }
            const progress = time - startTimeRef.current;
            onFrameRef.current(progress);
            requestRef.current = requestAnimationFrame(callback);
        };
        requestRef.current = requestAnimationFrame(callback);
        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
        };
    }, [disabled]);
}

export default useAnimationFrame;
