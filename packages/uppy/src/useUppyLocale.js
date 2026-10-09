import { useEffect, useState } from 'react';

import { loadPackage } from '@panneau/core/utils';

/**
 * Locale loader
 */
const packagesCache = {};
const defaultPackagesMap = {
    fr: () => loadPackage('@uppy/locales/lib/fr_FR', () => import('@uppy/locales/lib/fr_FR')),
    en: () => loadPackage('@uppy/locales/lib/en_US', () => import('@uppy/locales/lib/en_US')),
};

function getPackageKey(locale, packagesMap) {
    if (locale !== null && typeof packagesMap[locale] !== 'undefined') {
        return locale;
    }
    // Fallback to the base language (ex: fr-CA => fr), then to english
    const baseLocale = locale !== null ? `${locale}`.split(/[-_]/)[0].toLowerCase() : null;
    if (baseLocale !== null && typeof packagesMap[baseLocale] !== 'undefined') {
        return baseLocale;
    }
    return typeof packagesMap.en !== 'undefined' ? 'en' : null;
}

function useUppyLocale(locale, { packagesMap = defaultPackagesMap } = {}) {
    const packageKey = getPackageKey(locale || null, packagesMap);
    const [{ key: loadedKey, package: loadedPackage }, setLoadedPackage] = useState({
        key: packageKey,
        package: packagesCache[packageKey] || null,
    });
    // Reset the loaded package when the locale changes
    const currentPackage =
        loadedKey === packageKey ? loadedPackage : packagesCache[packageKey] || null;
    const packageLoader = packageKey !== null ? packagesMap[packageKey] || null : null;
    useEffect(() => {
        let canceled = false;
        if (currentPackage !== null || packageLoader === null) {
            return () => {
                canceled = true;
            };
        }

        packageLoader().then(({ default: dep }) => {
            // packagesCache[locale] = dep;
            if (!canceled) {
                setLoadedPackage({
                    key: packageKey,
                    package: dep,
                });
            }
        });
        return () => {
            canceled = true;
        };
    }, [packageKey, packageLoader, currentPackage, setLoadedPackage]);
    return currentPackage;
}

export default useUppyLocale;
