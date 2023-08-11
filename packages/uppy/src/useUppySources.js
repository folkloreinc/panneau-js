import { useState, useEffect, useMemo } from 'react';

import { loadPackage } from '@panneau/core/utils';

/**
 * Locale loader
 */
let packagesCache = {};
const defaultPackagesMap = {
    webcam: () => loadPackage('@uppy/webcam', () => import('@uppy/webcam')),
    facebook: () => loadPackage('@uppy/facebook', () => import('@uppy/facebook')),
    instagram: () => loadPackage('@uppy/instagram', () => import('@uppy/instagram')),
    dropbox: () => loadPackage('@uppy/dropbox', () => import('@uppy/dropbox')),
    'google-drive': () => loadPackage('@uppy/google-drive', () => import('@uppy/google-drive')),
};
const useUppySources = (sources, { packagesMap = defaultPackagesMap } = {}) => {
    // transport
    const [{ packages: loadedPackages }, setLoadedPackages] = useState({
        packages: sources.reduce((map, source) => {
            const sourcePackage = packagesCache[source] || null;
            if (sourcePackage === null) {
                return map;
            }
            return {
                ...map,
                [source]: sourcePackage,
            };
        }, null),
    });
    const sourcesToLoad = useMemo(() => {
        if (loadedPackages === null) {
            return sources;
        }
        const sourcesLoaded = Object.keys(loadedPackages);
        return sources.filter((source) => sourcesLoaded.indexOf(source) === -1);
    }, [sources, loadedPackages]);
    useEffect(() => {
        let canceled = false;
        if (sourcesToLoad.length === 0) {
            return () => {
                canceled = true;
            };
        }

        Promise.all(
            sourcesToLoad
                .map((source) => packagesMap[source] || null)
                .filter((it) => it !== null)
                .map((promise) => promise()),
        ).then((packagesLoaded) => {
            const newLoadedPackages = sourcesToLoad.reduce((map, source, index) => {
                const { default: pack, ...others } = packagesLoaded[index];
                return {
                    ...map,
                    [source]: Object.keys(others).reduce((otherMap, key) => {
                        otherMap[key] = others[key]; // eslint-disable-line no-param-reassign
                        return otherMap;
                    }, pack),
                };
            }, {});
            packagesCache = {
                ...packagesCache,
                ...newLoadedPackages,
            };
            if (!canceled) {
                setLoadedPackages({
                    packages: newLoadedPackages,
                });
            }
        });
        return () => {
            canceled = true;
        };
    }, [sourcesToLoad, packagesMap, loadedPackages, setLoadedPackages]);
    return sourcesToLoad.length === 0 ? loadedPackages : null;
};

export default useUppySources;
