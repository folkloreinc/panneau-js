import { match as matchMediaQuery } from 'css-mediaquery';
import { useEffect, useMemo, useState } from 'react';

import { useResizeObserver } from './useObserver';

interface Screen {
    name: string;
    mediaQuery?: string | null;
}

interface Media {
    type: string;
    width: string;
    height: string;
}

interface UseScreenSizeOptions {
    width?: number | null;
    height?: number | null;
    landscape?: boolean;
    screens?: Screen[];
    mediaType?: string;
    media?: Media | null;
}

interface ScreenSize {
    screen: string | null;
    screens: string[];
    width: number | null;
    height: number | null;
    landscape: boolean;
}

const useScreenSize = ({
    width = null,
    height = null,
    landscape = false,
    screens = [],
    mediaType = 'screen',
    media: providedMedia = null,
}: UseScreenSizeOptions): ScreenSize => {
    // Get media
    const media = useMemo(
        () =>
            providedMedia !== null
                ? providedMedia
                : {
                      type: mediaType,
                      width: `${width}px`,
                      height: `${height}px`,
                  },
        [providedMedia, mediaType, width, height],
    );

    // Get matching screens
    const matchingScreens = useMemo(
        () =>
            [...screens]
                .reverse()
                .filter(
                    ({ mediaQuery = null }) =>
                        mediaQuery === null || matchMediaQuery(mediaQuery, media),
                ),
        [screens, media],
    );

    return {
        screen: matchingScreens.length > 0 ? matchingScreens[0].name : null,
        screens: [...matchingScreens].reverse().map(({ name }) => name),
        width,
        height,
        landscape,
    };
};

interface UseScreenSizeFromElementOptions extends Omit<UseScreenSizeOptions, 'landscape'> {
    withoutMaxSize?: boolean;
}

interface UseScreenSizeFromElementReturn {
    ref: React.RefObject<Element>;
    screenSize: ScreenSize;
}

export const useScreenSizeFromElement = ({
    width = null,
    height = null,
    ...opts
}: UseScreenSizeFromElementOptions = {}): UseScreenSizeFromElementReturn => {
    const {
        ref,
        entry: { contentRect },
    } = useResizeObserver();
    const { width: calculatedWidth = 0, height: calculatedHeight = 0 } = contentRect || {};
    const semiFinalWidth = width !== null ? width : calculatedWidth;
    const semiFinalHeight = height !== null ? height : calculatedHeight;

    const landscape = semiFinalHeight > 0 && semiFinalWidth > semiFinalHeight;
    const { withoutMaxSize = false, ...restOpts } = opts;

    let finalWidth =
        landscape && !withoutMaxSize
            ? Math.round(Math.max(320, 0.45 * semiFinalHeight))
            : semiFinalWidth;
    let finalHeight =
        landscape && !withoutMaxSize
            ? Math.round(Math.max(533, 0.75 * semiFinalHeight))
            : semiFinalHeight;
    if (finalWidth % 2 === 1) {
        finalWidth -= 1;
    }

    if (finalHeight % 2 === 1) {
        finalHeight -= 1;
    }

    const screenSize = useScreenSize({
        width: finalWidth,
        height: finalHeight,
        landscape,
        ...restOpts,
    });

    return {
        ref,
        screenSize,
    };
};

interface WindowSize {
    width: number | null;
    height: number | null;
}

const getWindowSize = (): WindowSize => ({
    width: typeof window !== 'undefined' ? window.innerWidth : null,
    height: typeof window !== 'undefined' ? window.innerHeight : null,
});

export const useScreenSizeFromWindow = (opts: UseScreenSizeOptions = {}): ScreenSize => {
    const [windowSize, setWindowSize] = useState<WindowSize>(getWindowSize());
    useEffect(() => {
        const onResize = () => setWindowSize(getWindowSize());
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', onResize);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', onResize);
            }
        };
    }, [setWindowSize]);
    return useScreenSize({
        ...opts,
        ...windowSize,
    });
};

export default useScreenSize;
