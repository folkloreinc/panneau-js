import MediaField, { MediaFieldProps } from './MediaField';

function FontField(props: MediaFieldProps) {
    return <MediaField fileTypes={['.ttf', '.otf']} {...props} />;
}

export default FontField;
