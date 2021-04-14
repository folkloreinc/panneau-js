import { useState, useEffect } from 'react';

/**
 * Locale loader
 */
let packageCache = null;
const useQuill = ({ disabled = false, inline = false }) => {
    // transport
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
            const onThemeLoaded = () => {
                import('react-quill').then(component => {
                    const { default: EditorBuild } = component;
                    packageCache = EditorBuild;
                    if (!canceled) {
                        setLoadedPackage({
                            package: EditorBuild,
                        });
                    }
                });
            }
            if (inline) {
                import('react-quill/dist/quill.bubble.css').then(onThemeLoaded);
            } else {
                import('react-quill/dist/quill.snow.css').then(onThemeLoaded);
            }            
        }
        return () => {
            canceled = true;
        };
    }, [loadedPackage, setLoadedPackage, inline]);
    return loadedPackage;
};

export default useQuill;
