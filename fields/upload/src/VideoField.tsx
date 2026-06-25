import UploadField, { UploadFieldProps } from './UploadField';

function VideoUploadField(props: UploadFieldProps) {
    return <UploadField {...props} types={['video']} />;
}

export default VideoUploadField;
