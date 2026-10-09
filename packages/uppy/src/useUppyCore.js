import { useEffect, useState } from 'react';

import { loadPackage } from '@panneau/core/utils';

/**
 * Locale loader
 */
let packageCache = null;

const loadUppyCore = () => import('@uppy/core');

function useUppyCore() {
    // transport
    const [{ package: loadedPackage }, setLoadedPackage] = useState({
        package: packageCache,
    });
    useEffect(() => {
        let canceled = false;
        if (loadedPackage !== null) {
            return () => {
                canceled = true;
            };
        }
        loadPackage('@uppy/core', loadUppyCore).then(({ default: Uppy }) => {
            packageCache = Uppy;
            if (!canceled) {
                setLoadedPackage({
                    package: Uppy,
                });
            }
        });
        return () => {
            canceled = true;
        };
    }, [loadedPackage, setLoadedPackage]);
    return loadedPackage;
}

export default useUppyCore;
