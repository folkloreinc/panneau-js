import MediaField, { MediaFieldProps } from './MediaField';

function DocumentField(props: MediaFieldProps) {
    return <MediaField fileTypes={['.pdf']} {...props} types={['document']} />;
}

export default DocumentField;
