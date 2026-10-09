import { useEffect, useState } from 'react';

const loaders = {
    fr: () => import(`ckeditor5/translations/fr`),
    en: () => import(`ckeditor5/translations/en`),
};

function useCKEditorTranslations(locale) {
    const [loadedState, setLoadedState] = useState({
        locale: false,
        translations: null,
    });
    const { locale: loaded, translations } = loadedState;

    useEffect(() => {
        let canceled = false;
        if (loaded === locale) {
            return () => {
                canceled = true;
            };
        }
        (loaders[locale] || (() => Promise.reject()))()
            .then(({ default: newTranslations }) => {
                if (!canceled) {
                    setLoadedState({
                        locale,
                        translations: newTranslations,
                    });
                }
            })
            // eslint-disable-next-line no-console
            .catch((e) => console.log('err loading translations', e));
        return () => {
            canceled = true;
        };
    }, [locale, loaded, setLoadedState]);

    return translations;
}

export default useCKEditorTranslations;
