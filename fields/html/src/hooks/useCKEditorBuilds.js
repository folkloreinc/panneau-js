import { useEffect, useRef, useState } from 'react';

const useCKEditorBuilds = () => {
    const [loaded, setLoaded] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        let canceled = false;
        if (loaded) {
            return () => {
                canceled = true;
            };
        }
        import('@panneau/ckeditor/build')
            .then(({ default: Editors }) => {
                if (!canceled) {
                    ref.current = Editors;
                    setLoaded(true);
                }
            })
            // eslint-disable-next-line no-console
            .catch((e) => console.log('err loading editor', e));
        return () => {
            canceled = true;
        };
    }, [loaded, setLoaded]);

    return ref.current;
};

export default useCKEditorBuilds;
