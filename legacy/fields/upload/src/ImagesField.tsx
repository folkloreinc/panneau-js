import UploadField, { UploadFieldProps } from './UploadField';

function ImagesUploadField(props: UploadFieldProps) {
    return <UploadField {...props} types={['image']} multiple />;
}

export default ImagesUploadField;
