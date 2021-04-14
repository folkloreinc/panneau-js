import { useState, useEffect } from 'react';

/**
 * Locale loader
 */
let packageCache = null;
const useCKEditorBuild = ({ disabled = false, inline = false }) => {
    
    const [{ package: loadedPackage }, setLoadedPackage] = useState({
        package: packageCache,
    });

    useEffect(() => {
        let canceled = false;
        if (loadedPackage !== null) {
            return () => {
                canceled = true;
            };
        }
        if (!disabled) {
            const onEditorBuildLoaded = ({ default: EditorBuild }) => {
                packageCache = EditorBuild;
                if (!canceled) {
                    setLoadedPackage({
                        package: EditorBuild,
                    });
                }
            };

            if (inline) {
                import('@ckeditor/ckeditor5-build-inline').then(onEditorBuildLoaded);
            } else {
                import('@ckeditor/ckeditor5-build-classic').then(onEditorBuildLoaded);
            }         
        }
        return () => {
            canceled = true;
        };
    }, [loadedPackage, setLoadedPackage, disabled, inline]);

    return loadedPackage;
};

export default useCKEditorBuild;
