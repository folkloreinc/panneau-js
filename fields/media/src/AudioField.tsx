import MediaField from './MediaField';

interface AudioFieldProps {
    [key: string]: unknown;
}

function AudioField(props: AudioFieldProps) {
    return <MediaField {...props} types={['audio']} />;
}

export default AudioField;
