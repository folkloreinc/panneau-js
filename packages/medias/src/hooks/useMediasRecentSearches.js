import { useCallback } from 'react';

const useMediasRecent = (opts, key = 'media-gallery-recent-searches') => {
    const addSearchValue = useCallback(
        (value) => {
            if (
                typeof window !== 'undefined' &&
                typeof window.localStorage !== 'undefined' &&
                value
            ) {
                const recent = window.localStorage.getItem(key) || null;
                const current = recent !== null ? JSON.parse(recent || '[]') : [];
                const encoded = JSON.stringify([value, ...current]);
                window.localStorage.setItem(key, encoded);
                return true;
            }
            return false;
        },
        [key],
    );

    const getSearchValues = useCallback(
        (count = 5) => {
            if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
                const recent = window.localStorage.getItem(key) || null;
                const current = recent !== null ? JSON.parse(recent || '[]') : [];
                return current.slice(0, count);
            }
            return [];
        },
        [key],
    );

    return {
        addSearchValue,
        getSearchValues,
    };
};

export default useMediasRecent;
