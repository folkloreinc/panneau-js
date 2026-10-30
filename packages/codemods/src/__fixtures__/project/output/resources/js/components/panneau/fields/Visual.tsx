import { useFieldComponent } from '@panneau/core/contexts';
import { defineMessages, FormattedMessage } from 'react-intl';

import { ImageField } from '@panneau/media';
import { type FieldEntryProps, getFieldProps } from '@panneau/fields';
import { Fieldset } from '@panneau/ui';

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
    // TODO(panneau-5): `useFieldComponent('video_or_embed')` renders a field of the project: import its component
    const VideoOrEmbedField = useFieldComponent('video_or_embed');
    const { image = null, video = null } = value || {};
    const hasValue = image !== null || video !== null;

    // TODO(panneau-5): `<ImageField>`: `withButton` is not a prop of `ImageField` of `@panneau/media`
    // TODO(panneau-5): `<ImageField>` is `ImageField` of `@panneau/media`: it needs `resource`, the id of the media library, and the `mediaPlugin`
    // TODO(panneau-5): Bootstrap classes `d-flex`, `align-items-center` in `className`: Panneau 5 has no Bootstrap (`@panneau/ui` primitives, CSS Modules, or the Bootstrap-compatible theme)
    // TODO(panneau-5): Bootstrap class `mx-2` in `className`: Panneau 5 has no Bootstrap (`@panneau/ui` primitives, CSS Modules, or the Bootstrap-compatible theme)
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

// TODO(panneau-5): `VisualFieldEntry` reads `imageField`, `videoField` from the `settings` of the field: give them with `settings()` of the PHP field
/** The registry entry of `VisualField` for Panneau 5: its props from the field (written by @panneau/codemods). */
export function VisualFieldEntry(props: FieldEntryProps) {
    const { label, description, errors, required, className } = getFieldProps(props);
    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            className={className}
        >
            <VisualField
                imageField={props.field.settings?.imageField as VisualFieldProps['imageField']}
                videoField={props.field.settings?.videoField as VisualFieldProps['videoField']}
                value={props.value as VisualFieldProps['value']}
                onChange={props.onChange}
            />
        </Fieldset>
    );
}
