import { getJSON } from '@folklore/fetch';
import isObject from 'lodash/isObject';
import uniqBy from 'lodash/uniqBy';
import { createContext, use, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { Font } from '../types';
import { useGoogleKeys } from './GoogleKeysContext';

interface FontsContextValue {
    systemFonts: Font[] | null;
    googleFonts: Font[] | null;
    customFonts: Font[] | null;
    setGoogleFonts?: ((fonts: Font[]) => void) | null;
}

export const FontsContext = createContext<FontsContextValue>({
    systemFonts: null,
    googleFonts: null,
    customFonts: null,
});

export function useGoogleFonts({
    disabled = false,
    setFonts = null,
}: {
    disabled?: boolean;
    setFonts?: ((fonts: Font[]) => void) | null;
} = {}): Font[] | null {
    const { apiKey } = useGoogleKeys();
    const [googleFonts, setGoogleFonts] = useState<Font[] | null>(null);
    useEffect(() => {
        let canceled = false;
        if (apiKey !== null && !disabled) {
            getJSON(
                `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`,
            ).then(({ items = [] }: { items?: any[] }) => {
                if (!canceled) {
                    const newFonts = items.map((it) => ({
                        type: 'google',
                        name: it.family,
                        variants: it.variants,
                    }));
                    if (setFonts !== null) {
                        setFonts(newFonts);
                    } else {
                        setGoogleFonts(newFonts);
                    }
                }
            });
        }
        return () => {
            canceled = true;
        };
    }, [apiKey, disabled, setFonts, setGoogleFonts]);
    return googleFonts;
}

export function useFonts({
    withoutGoogleFonts = false,
}: { withoutGoogleFonts?: boolean } = {}): FontsContextValue {
    const {
        setGoogleFonts = null,
        systemFonts = null,
        googleFonts = null,
        customFonts = null,
    } = use(FontsContext);

    useGoogleFonts({
        disabled: withoutGoogleFonts || (googleFonts !== null && googleFonts.length > 0),
        setFonts: setGoogleFonts,
    });

    const fonts = useMemo(
        () => ({
            systemFonts,
            googleFonts,
            customFonts,
        }),
        [systemFonts, googleFonts, customFonts],
    );

    return fonts;
}

const DEFAULT_SYSTEM_FONTS: string[] = [
    'Arial',
    'Courier',
    'Georgia',
    'Times New Roman',
    'Verdana',
];

interface FontsProviderProps {
    children: ReactNode;
    systemFonts?: (Font | string)[] | null;
    customFonts?: (Font | string)[] | null;
}

function FontsProvider({
    systemFonts = DEFAULT_SYSTEM_FONTS,
    customFonts = null,
    children,
}: FontsProviderProps) {
    const {
        systemFonts: previousSystemFonts = null,
        googleFonts: previousGoogleFonts = null,
        customFonts: previousCustomFonts = null,
    } = useFonts();

    const [googleFonts, setGoogleFonts] = useState<Font[] | null>(null);

    const fonts = useMemo(
        () => ({
            systemFonts: uniqBy([...(previousSystemFonts || []), ...(systemFonts || [])], (font) =>
                isObject(font) ? font.name : font,
            ),
            googleFonts: uniqBy([...(previousGoogleFonts || []), ...(googleFonts || [])], (font) =>
                isObject(font) ? font.name : font,
            ),
            customFonts: uniqBy([...(previousCustomFonts || []), ...(customFonts || [])], (font) =>
                isObject(font) ? font.name : font,
            ),
            setGoogleFonts,
        }),
        [
            previousSystemFonts,
            previousGoogleFonts,
            previousCustomFonts,
            customFonts,
            systemFonts,
            googleFonts,
            setGoogleFonts,
        ],
    );

    return <FontsContext value={fonts}>{children}</FontsContext>;
}

export { FontsProvider };
