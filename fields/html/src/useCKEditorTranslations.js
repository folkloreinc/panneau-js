import { useEffect, useRef, useState } from 'react';

const loaders = {
    fr: () => import(`ckeditor5/translations/fr`),
    en: () => import(`ckeditor5/translations/en`),
};

function useCKEditorTranslations(locale) {
    const [loaded, setLoaded] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        let canceled = false;
        if (loaded === locale) {
            return () => {
                canceled = true;
            };
        }
        (loaders[locale] || (() => Promise.reject()))()
            .then(({ default: translations }) => {
                if (!canceled) {
                    ref.current = translations;
                    setLoaded(locale);
                }
            })
            // eslint-disable-next-line no-console
            .catch((e) => console.log('err loading translations', e));
        return () => {
            canceled = true;
        };
    }, [locale, loaded, setLoaded]);

    return ref.current;
}

export default useCKEditorTranslations;
