import { useEffect, useState } from 'react';

const loadCKEditor = () => import('@panneau/ckeditor');

function useCKEditor() {
    const [editors, setEditors] = useState(null);
    const loaded = editors !== null;

    useEffect(() => {
        let canceled = false;
        if (loaded) {
            return () => {
                canceled = true;
            };
        }
        loadCKEditor()
            .then((Editors) => {
                if (!canceled) {
                    setEditors(Editors);
                }
            })
            // eslint-disable-next-line no-console
            .catch((e) => console.log('err loading editor', e));
        return () => {
            canceled = true;
        };
    }, [loaded, setEditors]);

    return editors;
}

export default useCKEditor;
