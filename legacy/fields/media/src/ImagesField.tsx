import MediaField, { MediaFieldProps } from './MediaField';

function ImagesField(props: MediaFieldProps) {
    return <MediaField {...props} types={['image']} multiple />;
}

export default ImagesField;
