import { useEffect, useState } from 'react';

import { loadPackage } from '@panneau/core/utils';

/**
 * Locale loader
 */
const packagesCache = {};
const defaultPackagesMap = {
    transloadit: () => loadPackage('@uppy/transloadit', () => import('@uppy/transloadit')),
    tus: () => loadPackage('@uppy/tus', () => import('@uppy/tus')),
    xhr: () => loadPackage('@uppy/xhr-upload', () => import('@uppy/xhr-upload')),
};
function useUppyTransport(transport, { packagesMap = defaultPackagesMap } = {}) {
    // transport
    const [loadedPackageState, setLoadedPackageState] = useState({
        package: packagesCache[transport] || null,
    });
    const { package: loadedPackage } = loadedPackageState;
    const packageLoader = packagesMap[transport] || null;
    useEffect(() => {
        let canceled = false;
        if (loadedPackage !== null || packageLoader === null) {
            return () => {
                canceled = true;
            };
        }

        packageLoader().then(({ default: pack, ...others }) => {
            const dep = Object.keys(others).reduce((map, key) => {
                map[key] = others[key];
                return map;
            }, pack);
            packagesCache[transport] = dep;
            if (!canceled) {
                setLoadedPackageState({
                    package: dep,
                });
            }
        });
        return () => {
            canceled = true;
        };
    }, [packageLoader, loadedPackage, setLoadedPackageState, transport]);
    return loadedPackage;
}

export default useUppyTransport;
