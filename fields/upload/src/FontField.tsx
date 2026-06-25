import UploadField, { UploadFieldProps } from './UploadField';

function FontUploadField(props: UploadFieldProps) {
    return <UploadField fileTypes={['.ttf', '.otf']} {...props} />;
}

export default FontUploadField;
