import { useEffect, useMemo, useState } from 'react';

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
function useUppySources(sources, { packagesMap = defaultPackagesMap } = {}) {
    // transport
    const [{ packages: loadedPackages }, setLoadedPackages] = useState(() => ({
        packages: (sources || []).reduce((map, source) => {
            const sourcePackage = packagesCache[source] || null;
            if (sourcePackage === null) {
                return map;
            }
            return {
                ...map,
                [source]: sourcePackage,
            };
        }, {}),
    }));
    const sourcesToLoad = useMemo(() => {
        const sourcesLoaded = Object.keys(loadedPackages);
        // Only load known sources that are not already loaded
        return (sources || []).filter(
            (source) =>
                sourcesLoaded.indexOf(source) === -1 && (packagesMap[source] || null) !== null,
        );
    }, [sources, loadedPackages, packagesMap]);
    useEffect(() => {
        let canceled = false;
        if (sourcesToLoad.length === 0) {
            return () => {
                canceled = true;
            };
        }

        Promise.all(sourcesToLoad.map((source) => packagesMap[source]())).then((packagesLoaded) => {
            const newLoadedPackages = sourcesToLoad.reduce((map, source, index) => {
                const { default: pack, ...others } = packagesLoaded[index];
                return {
                    ...map,
                    [source]: Object.keys(others).reduce((otherMap, key) => {
                        otherMap[key] = others[key];
                        return otherMap;
                    }, pack),
                };
            }, {});
            packagesCache = {
                ...packagesCache,
                ...newLoadedPackages,
            };
            if (!canceled) {
                setLoadedPackages(({ packages }) => ({
                    packages: {
                        ...packages,
                        ...newLoadedPackages,
                    },
                }));
            }
        });
        return () => {
            canceled = true;
        };
    }, [sourcesToLoad, packagesMap, setLoadedPackages]);
    return sourcesToLoad.length === 0 ? loadedPackages : null;
}

export default useUppySources;
