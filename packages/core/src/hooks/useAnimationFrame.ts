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
    const callback = (time: number) => {
        if (!startTimeRef.current) {
            startTimeRef.current = time;
        }
        const progress = time - startTimeRef.current;
        onFrame(progress);
        requestRef.current = requestAnimationFrame(callback);
    };

    useEffect(() => {
        if (!disabled) {
            requestRef.current = requestAnimationFrame(callback);
        }
        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [disabled]);
}

export default useAnimationFrame;
