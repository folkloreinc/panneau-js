import UploadField, { UploadFieldProps } from './UploadField';

function AudioUploadField(props: UploadFieldProps) {
    return <UploadField {...props} types={['audio']} />;
}

export default AudioUploadField;
