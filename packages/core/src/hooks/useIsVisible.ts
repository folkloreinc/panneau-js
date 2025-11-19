import { useRef } from 'react';
import { useIntersectionObserver } from './useObserver';

interface UseIsVisibleOptions {
    rootMargin?: string;
    threshold?: number;
    persist?: boolean;
}

interface UseIsVisibleResult {
    ref: React.RefObject<HTMLElement>;
    visible: boolean;
}

function useIsVisible({
    rootMargin,
    threshold = 1,
    persist = false,
}: UseIsVisibleOptions = {}): UseIsVisibleResult {
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
}

export default useIsVisible;
