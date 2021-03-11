import { useState, useEffect } from 'react';

/**
 * Locale loader
 */
const packagesCache = {};
const defaultPackagesMap = {
    fr: () => import('@uppy/locales/lib/fr_FR'),
    en: () => import('@uppy/locales/lib/en_US'),
};
const useUppyLocale = (locale, { packagesMap = defaultPackagesMap } = {}) => {
    const [{ package: loadedPackage }, setLoadedPackage] = useState({
        package: packagesCache[locale] || null
    });
    const packageLoader = packagesMap[locale] || null;
    useEffect(() => {
        let canceled = false;
        if (loadedPackage !== null || packageLoader === null) {
            return () => {
                canceled = true;
            };
        }

        packageLoader().then(
            ({ default: dep }) => {
                // packagesCache[locale] = dep;
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

export default useUppyLocale;
