import MediaField from './MediaField';

interface DocumentFieldProps {
    [key: string]: unknown;
}

function DocumentField(props: DocumentFieldProps) {
    return <MediaField fileTypes={['.pdf']} {...props} types={['document']} />;
}

export default DocumentField;
