import { useState, useEffect } from 'react';

/**
 * Locale loader
 */
let packageCache = null;
const useUppyCore = () => {
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
        import('@uppy/core').then(({ default: Uppy }) => {
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
};

export default useUppyCore;
