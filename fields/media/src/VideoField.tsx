import MediaField, { MediaFieldProps } from './MediaField';

function VideoField(props: MediaFieldProps) {
    return <MediaField {...props} types={['video']} />;
}

export default VideoField;
