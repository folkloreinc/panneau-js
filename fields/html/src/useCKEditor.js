import { useEffect, useRef, useState } from 'react';

function useCKEditor() {
    const [loaded, setLoaded] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        let canceled = false;
        if (loaded) {
            return () => {
                canceled = true;
            };
        }
        import('@panneau/ckeditor')
            .then((Editors) => {
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
}

export default useCKEditor;
