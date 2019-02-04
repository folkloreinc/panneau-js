import Loadable from 'react-loadable';

export const FileInput = Loadable({
    loader: () => import('react-fine-uploader/file-input'),
    loading: () => null,
});

export const loadUploader = () => import('fine-uploader-wrappers').then(
    ({ default: FineUploaderTraditional }) => FineUploaderTraditional,
);
