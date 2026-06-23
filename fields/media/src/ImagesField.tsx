import MediaField from './MediaField';

interface ImagesFieldProps {
    [key: string]: unknown;
}

function ImagesField(props: ImagesFieldProps) {
    return <MediaField {...props} types={['image']} multiple />;
}

export default ImagesField;
