import type { RefObject } from 'react';
import { useState } from 'react';

import { useIntersectionObserver } from './useObserver';

interface UseIsVisibleOptions {
    rootMargin?: string;
    threshold?: number;
    persist?: boolean;
}

interface UseIsVisibleResult {
    ref: RefObject<Element>;
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

    // Remember if the element has been intersecting once (used with `persist`)
    const [wasIntersecting, setWasIntersecting] = useState(isIntersecting);
    if (isIntersecting && !wasIntersecting) {
        setWasIntersecting(true);
    }
    const hasIntersected = wasIntersecting || isIntersecting;

    const isVisible = (!persist && isIntersecting) || (persist && hasIntersected);

    return {
        ref,
        visible: isVisible,
    };
}

export default useIsVisible;
