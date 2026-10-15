import UploadField, { UploadFieldProps } from './UploadField';

function ImageUploadField(props: UploadFieldProps) {
    return <UploadField {...props} types={['image']} />;
}

export default ImageUploadField;
