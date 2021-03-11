import { useRef, useEffect } from 'react';

const useAnimationFrame = (onFrame, { disabled = false } = {}) => {
    const requestRef = useRef(null);
    const startTimeRef = useRef(null);
    const callback = (time) => {
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
};

export default useAnimationFrame;
