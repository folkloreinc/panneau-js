import MediaField from './MediaField';

interface FontFieldProps {
    [key: string]: unknown;
}

function FontField(props: FontFieldProps) {
    return <MediaField fileTypes={['.ttf', '.otf']} {...props} />;
}

export default FontField;
