import { useEffect, useRef, useState } from 'react';

const useCKEditorBuild = () => {
    const [loaded, setLoaded] = useState(null);
    const ref = useRef(null);
    useEffect(() => {
        let canceled = false;
        if (loaded) {
            return () => {
                canceled = true;
            };
        }
        import('@panneau/ckeditor/build').then(({ default: Editor = null }) => {
            if (!canceled) {
                ref.current = Editor;
                setLoaded(true);
            }
        });
        return () => {
            canceled = true;
        };
    }, [loaded, setLoaded]);
    return ref.current;
};

export default useCKEditorBuild;
