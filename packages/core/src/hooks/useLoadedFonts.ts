import isObject from 'lodash/isObject';
import { useEffect, useState } from 'react';

import { loadPackage } from '../utils';

interface FontsMap {
    loading: string[];
    active: string[];
}

interface FontConfig {
    type?: 'google' | 'custom' | 'system';
    name: string;
}

interface WebFontConfig {
    google?: {
        families: string[];
    };
    custom?: {
        families: string[];
    };
    timeout?: number;
    active?: () => void;
    fontloading?: (name: string) => void;
    fontactive?: (name: string) => void;
    fontinactive?: (name: string) => void;
}

interface WebFont {
    load: (config: WebFontConfig) => void;
}

const fontsMap: FontsMap = {
    loading: [],
    active: [],
};

function isFontLoading(name: string): boolean {
    return fontsMap.loading.indexOf(name) !== -1;
}

function isFontActive(name: string): boolean {
    return fontsMap.active.indexOf(name) !== -1;
}

function addFontLoading(name: string): void {
    fontsMap.active = fontsMap.active.filter((it) => it !== name);
    fontsMap.loading = [...fontsMap.loading, name];
}

function removeFontLoading(name: string): void {
    fontsMap.loading = fontsMap.loading.filter((it) => it !== name);
}

function addFontActive(name: string): void {
    fontsMap.loading = fontsMap.loading.filter((it) => it !== name);
    fontsMap.active = [...fontsMap.active, name];
}

function useLoadedFonts(fonts: (string | FontConfig)[]): { loaded: boolean } {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const config = fonts.reduce<Record<string, { families: string[] }> | null>(
            (newConfig, font) => {
                const { type, name } = isObject(font)
                    ? (font as FontConfig)
                    : {
                          type: 'system' as const,
                          name: font as string,
                      };
                if (
                    (type === 'google' || type === 'custom') &&
                    !isFontLoading(name) &&
                    !isFontActive(name)
                ) {
                    return {
                        ...newConfig,
                        [type]: {
                            families: [
                                ...(newConfig !== null
                                    ? (newConfig[type] || {}).families || []
                                    : []),
                                name,
                            ],
                        },
                    };
                }
                return newConfig;
            },
            null,
        );

        const hasConfig = config !== null;

        if (hasConfig && typeof window !== 'undefined') {
            loadPackage('webfontloader', () => import('webfontloader')).then(
                ({ default: WebFont }: { default: WebFont }) =>
                    WebFont.load({
                        ...config,
                        timeout: 3000,
                        active: () => setLoaded(true),
                        fontloading: (name: string) => addFontLoading(name),
                        fontactive: (name: string) => addFontActive(name),
                        fontinactive: (name: string) => removeFontLoading(name),
                    }),
            );
        } else {
            setLoaded(true);
        }
    }, [fonts, setLoaded]);
    return { loaded };
}

export default useLoadedFonts;
