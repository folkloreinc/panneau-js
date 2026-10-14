import MediaField, { MediaFieldProps } from './MediaField';

function ImageField(props: MediaFieldProps) {
    return <MediaField {...props} types={['image']} />;
}

export default ImageField;
