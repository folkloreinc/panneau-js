import MediaField, { MediaFieldProps } from './MediaField';

function AudioField(props: MediaFieldProps) {
    return <MediaField {...props} types={['audio']} />;
}

export default AudioField;
