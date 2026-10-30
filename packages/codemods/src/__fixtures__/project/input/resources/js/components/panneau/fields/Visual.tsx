import { useFieldComponent } from '@panneau/core/contexts';
import { defineMessages, FormattedMessage } from 'react-intl';

const messages = defineMessages({
    or: { id: 'or', defaultMessage: 'or' },
});

interface VisualValue {
    image?: any;
    video?: any;
}

interface VisualFieldProps {
    imageField?: Record<string, unknown>;
    videoField?: Record<string, unknown>;
    value?: VisualValue | null;
    onChange?: ((value: VisualValue) => void) | null;
}

export default function VisualField({ imageField, videoField, value = null, onChange = null }: VisualFieldProps) {
    const ImageField = useFieldComponent('image');
    const VideoOrEmbedField = useFieldComponent('video_or_embed');
    const { image = null, video = null } = value || {};
    const hasValue = image !== null || video !== null;

    return (
        <div className={!hasValue ? 'd-flex align-items-center' : undefined}>
            {!hasValue || image !== null ? (
                <ImageField
                    {...imageField}
                    withButton
                    value={image}
                    onChange={(newValue: any) => onChange?.({ ...value, image: newValue })}
                />
            ) : null}
            {!hasValue ? (
                <span className="mx-2">
                    <FormattedMessage {...messages.or} />
                </span>
            ) : null}
            {!hasValue || video !== null ? (
                <VideoOrEmbedField
                    {...videoField}
                    value={video}
                    onChange={(newValue: any) => onChange?.({ ...value, video: newValue })}
                />
            ) : null}
        </div>
    );
}
