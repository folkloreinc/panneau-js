import { useRef } from 'react';
import { useIntersectionObserver } from './useObserver';

const useIsVisible = ({ rootMargin, threshold = 1, persist = false } = {}) => {
    const {
        ref,
        entry: { isIntersecting },
    } = useIntersectionObserver({
        rootMargin,
        threshold,
    });

    const wasIntersecting = useRef(isIntersecting);
    if (isIntersecting && !wasIntersecting.current) {
        wasIntersecting.current = isIntersecting;
    }

    const isVisible = (!persist && isIntersecting) || (persist && wasIntersecting.current);

    return {
        ref,
        visible: isVisible,
    };
};

export default useIsVisible;
