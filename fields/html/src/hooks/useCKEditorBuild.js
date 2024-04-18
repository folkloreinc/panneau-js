import { useEffect, useRef, useState } from 'react';

const useCKEditorBuild = () => {
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
            .then(({ default: Editor = null }) => {
                // console.log('my ed', Editor);
                if (!canceled) {
                    ref.current = Editor;
                    setLoaded(true);
                }
            })
            .catch((e) => console.log('err loading editor', e));

        return () => {
            canceled = true;
        };
    }, [loaded, setLoaded]);

    return ref.current;
};

export default useCKEditorBuild;
