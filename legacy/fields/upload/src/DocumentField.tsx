import UploadField, { UploadFieldProps } from './UploadField';

function DocumentUploadField(props: UploadFieldProps) {
    return <UploadField fileTypes={['.pdf']} {...props} types={['document']} />;
}

export default DocumentUploadField;
