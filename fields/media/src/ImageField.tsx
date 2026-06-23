import MediaField from './MediaField';

interface ImageFieldProps {
    [key: string]: unknown;
}

function ImageField(props: ImageFieldProps) {
    return <MediaField {...props} types={['image']} />;
}

export default ImageField;
