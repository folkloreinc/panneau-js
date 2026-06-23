import MediaField from './MediaField';

interface VideoFieldProps {
    [key: string]: unknown;
}

function VideoField(props: VideoFieldProps) {
    return <MediaField {...props} types={['video']} />;
}

export default VideoField;
