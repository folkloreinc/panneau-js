import { useState, useEffect } from 'react';

import loadPackage from '../utils/loadPackage';

/**
 * Locale loader
 */
const packagesCache = {};
const defaultPackagesMap = {
    transloadit: () => loadPackage('@uppy/transloadit', () => import('@uppy/transloadit')),
    tus: () => loadPackage('@uppy/tus', () => import('@uppy/tus')),
    xhr: () => loadPackage('@uppy/xhr-upload', () => import('@uppy/xhr-upload')),
};
const useUppyTransport = (transport, { packagesMap = defaultPackagesMap } = {}) => {
    // transport
    const [{ package: loadedPackage }, setLoadedPackage] = useState({
        package: packagesCache[transport] || null,
    });
    const packageLoader = packagesMap[transport] || null;
    useEffect(() => {
        let canceled = false;
        if (loadedPackage !== null || packageLoader === null) {
            return () => {
                canceled = true;
            };
        }

        packageLoader().then(
            ({ default: pack, ...others }) => {
                const dep = Object.keys(others).reduce((map, key) => {
                    map[key] = others[key]; // eslint-disable-line no-param-reassign
                    return map;
                }, pack);
                packagesCache[transport] = dep;
                if (!canceled) {
                    setLoadedPackage({
                        package: dep,
                    });
                }
            },
        );
        return () => {
            canceled = true;
        };
    }, [packageLoader, loadedPackage, setLoadedPackage]);
    return loadedPackage;
};

export default useUppyTransport;
