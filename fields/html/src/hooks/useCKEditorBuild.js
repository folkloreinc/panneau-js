import { useEffect, useState } from 'react';

/**
 * Locale loader
 */
const packageCache = null;
const useCKEditorBuild = () => {
    const [packages, setLoadedPackage] = useState(packageCache);

    const loadedPackage = packages;

    useEffect(() => {
        let canceled = false;
        if (loadedPackage !== null) {
            return () => {
                canceled = true;
            };
        }

        // import('@oanneau/ckeditor/build').then(({ default: { Editor = null } }) => {
        //     if (!canceled) {
        //         setLoadedPackage(Editor);
        //     }
        // });

        return () => {
            canceled = true;
        };
    }, [loadedPackage, setLoadedPackage]);
    return loadedPackage;
};

export default useCKEditorBuild;

// import { useEffect, useState } from 'react';

// import { loadPackage } from '@panneau/core/utils';

// /**
//  * Locale loader
//  */
// let packageCache = null;
// const useCKEditorBuild = ({ disabled = false, inline = false } = {}) => {
//     const [{ package: loadedPackage }, setLoadedPackage] = useState({
//         package: packageCache,
//     });

//     useEffect(() => {
//         let canceled = false;
//         if (loadedPackage !== null) {
//             return () => {
//                 canceled = true;
//             };
//         }
//         if (!disabled) {
//             const onEditorBuildLoaded = ({ default: EditorBuild }) => {
//                 packageCache = EditorBuild;
//                 if (!canceled) {
//                     setLoadedPackage({
//                         package: EditorBuild,
//                     });
//                 }
//             };

//             // if (inline) {
//             //     import('@ckeditor/ckeditor5-build-inline').then(onEditorBuildLoaded);
//             // } else {
//             //     import('@ckeditor/ckeditor5-build-classic').then(onEditorBuildLoaded);
//             // }

//             // loadPackage('@panneau/ckeditor/build', () => import('@panneau/ckeditor/build')).then(
//             //     onEditorBuildLoaded,
//             // );
//         }
//         return () => {
//             canceled = true;
//         };
//     }, [loadedPackage, setLoadedPackage, disabled, inline]);

//     return loadedPackage;
// };

// export default useCKEditorBuild;
