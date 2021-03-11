import { useRef, useEffect, useCallback } from 'react';
import { useSprings } from 'react-spring';
import clamp from 'lodash/clamp';
import { useDrag } from 'react-use-gesture';

export const useSwipe = ({
    width = null,
    items = [],
    withSpring = true,
    swipeWidthThreshold = 3,
    animateScale = false,
    disabled = false,
    lockAxis = false,
    onSwipeStart = null,
    onSwipeEnd = null,
    onSwipeCancel = null,
    onTap = null,
} = {}) => {
    const swipingIndex = useRef(null);
    const index = useRef(0);
    const lockedAxis = useRef(null);

    const hasWidth = width !== null;
    const windowWidth = typeof window !== 'undefined' && !hasWidth ? window.innerWidth : null;
    const currentWidth = hasWidth ? width : windowWidth;

    const count = items.length;

    const getItem = useCallback((x = 0, idx = 0, scale = 1) => ({
        x,
        zIndex: idx,
        scale,
    }));

    const getItems = useCallback(
        ({ down = false, mx = 0 } = {}) =>
            items.map((item, i) => {
                const x = disabled ? 0 : (i - index.current) * currentWidth + (down ? mx : 0);
                const scale =
                    !animateScale || disabled || !down ? 1 : 1 - Math.abs(mx) / currentWidth / 2;
                return getItem(x, i, scale);
            }),
        [disabled, items, index, currentWidth, animateScale],
    );

    // Initial items state
    const [itemsWithProps, set] = useSprings(items.length, (i) => ({
        x: disabled ? 0 : i * currentWidth,
        y: 0,
        zIndex: i,
        config: {
            ...(!withSpring ? { duration: 1 } : null),
        },
    }));

    const bind = useDrag(
        ({ down, movement: [mx, my], direction: [xDir], cancel, tap }) => {
            if (disabled) {
                cancel();
                return;
            }

            if (!down && swipingIndex.current === index.current) {
                lockedAxis.current = null;
                if (onSwipeCancel !== null) {
                    onSwipeCancel(index.current);
                }
            }

            // Block first and last moves
            /*
            if (down && index.current === items.length - 1 && xDir < 0) {
                cancel();
                return;
            }

            if (down && index.current === 0 && xDir > 0) {
                cancel();
                return;
            }
            */

            const movementX = !lockAxis || lockedAxis.current === 'x' ? mx : 0;
            const movementY = !lockAxis || lockedAxis.current === 'y' ? my : 0;

            if (down) {
                // Snap to next slide
                if (Math.abs(movementX) > currentWidth / swipeWidthThreshold) {
                    index.current = clamp(index.current + (xDir > 0 ? -1 : 1), 0, count - 1);
                    lockedAxis.current = null;
                    cancel();
                    if (onSwipeEnd !== null) {
                        onSwipeEnd(index.current);
                    }
                    return;
                }
            }

            set(getItems({ down, mx: movementX, my: movementY }));

            // saving current swiping index in a ref in order to have a section called only once when swipe just started or a tap was detected
            if (swipingIndex.current !== index.current) {
                if (down && !tap) {
                    if (onSwipeStart !== null) {
                        onSwipeStart(index.current);
                    }
                }
                if (!down && tap) {
                    if (onTap !== null) {
                        onTap();
                    }
                }
            }

            // lock swiping on axis from initial 3 pixels distance (Y axis requires to swipe down)
            if (lockAxis && down && lockedAxis.current === null) {
                const distanceX = Math.abs(mx);
                const distanceY = Math.abs(my);
                if (distanceX !== distanceY && (distanceY > 2 || distanceX > 2)) {
                    lockedAxis.current = distanceY > distanceX ? 'y' : 'x';
                }
            }

            swipingIndex.current = down && !tap ? index.current : null;
        },
        { filterTaps: true },
    );

    const reset = useCallback(() => {
        set(getItems());
    }, [disabled, items, index, currentWidth]);

    const setIndex = useCallback(
        (idx) => {
            index.current = idx;
            reset();
        },
        [reset],
    );

    // Reset on resize or others
    useEffect(() => {
        set(getItems());
    }, [items, width, set, disabled]);

    return {
        items: itemsWithProps,
        bind,
        index: index.current,
        setIndex,
    };
};

export default useSwipe;
