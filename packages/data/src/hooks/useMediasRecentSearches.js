import { useCallback } from 'react';

const useMediasRecent = (opts, key = 'media-gallery-recent-searches') => {
    const createSearch = useCallback(
        (value) => {
            if (window !== undefined && value) {
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

    const getSearches = useCallback(
        (count = 5) => {
            if (window !== undefined) {
                const recent = window.localStorage.getItem(key) || null;
                const current = recent !== null ? JSON.parse(recent || '[]') : [];
                return current.slice(0, count);
            }
            return [];
        },
        [key],
    );

    return {
        createSearch,
        getSearches,
    };
};

export default useMediasRecent;
