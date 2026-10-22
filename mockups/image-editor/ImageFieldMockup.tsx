import { Crop, ImageIcon, Images, Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

import type { MediaSource, PickerMedia } from '@panneau/media';
import { MediaPicker } from '@panneau/media/picker';
import { Badge, Button, Fieldset, IconButton, Text } from '@panneau/ui';

import type { TransformBase } from './ImageEditor';
import { ImageEditorMockup } from './ImageEditorMockup';
import styles from './ImageFieldMockup.module.css';
import { ImagePreview, baseOf } from './ImagePreview';
import { type MockImage, images } from './fixtures';
import { type Transform, cropInView, ratioLabel } from './geometry';

/** A media of the field's value, with its transform for this use. */
export interface ImageValue {
    image: MockImage;
    transform?: Transform;
    base?: TransformBase;
    /** The media's transform changed since this crop was made on it. */
    mediaChanged?: boolean;
}

const toPickerMedia = (image: MockImage): PickerMedia => ({
    id: image.id,
    label: image.label,
    fileName: image.fileName,
    media: {
        type: 'image',
        mime: 'image/jpeg',
        url: image.thumbnailUrl ?? image.url,
        thumbnailUrl: image.thumbnailUrl ?? image.url,
        width: image.mediaTransform?.rotate === 90 ? image.height : image.width,
        height: image.mediaTransform?.rotate === 90 ? image.width : image.height,
        size: 2_400_000,
        status: 'ready',
    },
});

/** A library of the mockups' images, for the media picker. */
export function createImageSource(library: readonly MockImage[] = images): MediaSource {
    return {
        id: 'images',
        label: 'Images',
        accept: ['image/*'],
        canCreate: true,
        sorts: [{ id: '-createdAt' }, { id: 'name' }],
        list: () =>
            Promise.resolve({
                items: library.map(toPickerMedia),
                nextCursor: null,
                total: library.length,
            }),
        get: (id) => {
            const found = library.find((image) => image.id === id) ?? images[0];
            return found !== undefined
                ? Promise.resolve(toPickerMedia(found))
                : Promise.reject(new Error('Not found'));
        },
        create: () => Promise.reject(new Error('The mockups don’t upload.')),
    };
}

const listOf = (ratios: readonly string[]) =>
    ratios.length > 1
        ? `${ratios.slice(0, -1).join(', ')} or ${ratios.at(-1) ?? ''}`
        : (ratios[0] ?? '');

export interface ImageFieldMockupProps {
    label: string;
    description?: string;
    multiple?: boolean;
    value?: readonly ImageValue[];
    ratios?: readonly string[];
    enforceRatios?: boolean;
    cropRequired?: boolean;
    transformBase?: TransformBase | 'choose';
    readOnly?: boolean;
    /** The library the picker shows. */
    library?: readonly MockImage[];
}

/**
 * A mockup of the `image` field: a `media` field for images, with the editor. "Edit" crops an
 * image for this use; when the field requires a crop, the editor opens right after a pick.
 */
export function ImageFieldMockup({
    label,
    description,
    multiple = false,
    value: initialValue = [],
    ratios,
    enforceRatios = false,
    cropRequired = false,
    transformBase = 'media',
    readOnly = false,
    library = images,
}: ImageFieldMockupProps) {
    const [value, setValue] = useState<readonly ImageValue[]>(initialValue);
    const [picking, setPicking] = useState(false);
    const [source] = useState(() => createImageSource(library));
    // The media being edited: an index of the value, or one just picked, before it is added.
    const [editing, setEditing] = useState<
        { index: number } | { picked: MockImage; replace: number | null } | null
    >(null);
    const [replacing, setReplacing] = useState<number | null>(null);

    const constraints = [
        ...(ratios !== undefined && ratios.length > 0
            ? [enforceRatios ? `${listOf(ratios)}` : `Suggested: ${listOf(ratios)}`]
            : []),
        ...(cropRequired ? ['Crop required'] : []),
    ];
    const missing = value.filter((entry) => cropRequired && entry.transform?.crop === undefined);
    const errors = missing.map(
        (entry) =>
            `Crop “${entry.image.label}”${ratios !== undefined && ratios.length > 0 ? ` to ${listOf(ratios)}` : ''}.`,
    );

    const editorFor = (entry: ImageValue | null, image: MockImage) => (
        <ImageEditorMockup
            image={image}
            initial={entry?.transform ?? {}}
            base={entry?.base ?? (transformBase === 'original' ? 'original' : 'media')}
            canChooseBase={transformBase === 'choose'}
            {...(ratios !== undefined ? { ratios } : {})}
            enforceRatios={enforceRatios}
            cropRequired={cropRequired}
            mediaChanged={entry?.mediaChanged === true}
            title={entry === null ? 'Crop for this use' : 'Edit image'}
            applyLabel={entry === null ? 'Use this crop' : 'Apply'}
            isOpen
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setEditing(null);
                }
            }}
            {...(entry === null
                ? {
                      onBack: () => {
                          setEditing(null);
                          setPicking(true);
                      },
                  }
                : {})}
            onApply={(transform, base) => {
                const next: ImageValue = { image, transform, base };
                if (editing !== null && 'index' in editing) {
                    setValue(value.map((item, index) => (index === editing.index ? next : item)));
                } else if (editing !== null && editing.replace !== null) {
                    const at = editing.replace;
                    setValue(value.map((item, index) => (index === at ? next : item)));
                } else {
                    setValue(multiple ? [...value, next] : [next]);
                }
            }}
        />
    );

    const pick = (picked: readonly MockImage[]) => {
        if (picked.length === 0) {
            return;
        }
        // A required crop is a step right after the pick, for a single image.
        const [first] = picked;
        if (cropRequired && picked.length === 1 && first !== undefined) {
            setEditing({ picked: first, replace: replacing });
            return;
        }
        const added = picked.map((image): ImageValue => ({ image }));
        if (replacing !== null) {
            setValue(value.map((item, index) => (index === replacing ? (added[0] ?? item) : item)));
        } else {
            setValue(multiple ? [...value, ...added] : added.slice(0, 1));
        }
    };

    const summary = (entry: ImageValue) => {
        const { size } = baseOf(entry.image, entry.base ?? 'media');
        const crop = cropInView(size, entry.transform ?? {});
        return `${String(Math.round(crop.width))} × ${String(Math.round(crop.height))} · ${ratioLabel(crop.width, crop.height)}`;
    };

    const badges = (entry: ImageValue) => (
        <>
            {entry.transform?.crop !== undefined ? (
                <Badge tone="info">Cropped for this use</Badge>
            ) : cropRequired ? (
                <Badge tone="warning">Needs a crop</Badge>
            ) : null}
            {entry.mediaChanged === true ? (
                <Badge tone="warning">Library version changed: check the crop</Badge>
            ) : null}
            {entry.image.mediaTransform !== undefined ? (
                <Badge tone="neutral">
                    {(entry.base ?? 'media') === 'media'
                        ? 'Over the library’s edits'
                        : 'From the original'}
                </Badge>
            ) : null}
        </>
    );

    const pickButtons = (
        <>
            <Button
                icon={Images}
                onPress={() => {
                    setReplacing(null);
                    setPicking(true);
                }}
            >
                {multiple ? 'Add images' : 'Choose image'}
            </Button>
            <Button icon={Upload} variant="ghost">
                {multiple ? 'Upload images' : 'Upload an image'}
            </Button>
        </>
    );

    const [single] = value;
    return (
        <>
            <Fieldset
                legend={label}
                description={
                    <>
                        {description}
                        {description !== undefined && constraints.length > 0 ? ' ' : null}
                        {constraints.length > 0 ? (
                            <span className={styles.constraints}>
                                {constraints.map((constraint) => (
                                    <Badge key={constraint}>{constraint}</Badge>
                                ))}
                            </span>
                        ) : null}
                    </>
                }
                errors={errors}
                className={styles.field}
            >
                {value.length === 0 ? (
                    <div className={styles.empty}>
                        <ImageIcon aria-hidden size={32} strokeWidth={1.5} />
                        <Text size="sm" muted>
                            {readOnly
                                ? 'No image'
                                : multiple
                                  ? 'Drop images here, or'
                                  : 'Drop an image here, or'}
                        </Text>
                        {readOnly ? null : <div className={styles.actions}>{pickButtons}</div>}
                    </div>
                ) : !multiple && single !== undefined ? (
                    <div className={styles.single}>
                        <ImagePreview
                            image={single.image}
                            base={single.base ?? 'media'}
                            transform={single.transform ?? {}}
                            label={single.image.label}
                            className={styles.singlePreview}
                        />
                        <div className={styles.info}>
                            <Text weight="medium">{single.image.label}</Text>
                            <Text size="sm" muted numeric>
                                {single.image.fileName} · {summary(single)}
                            </Text>
                            <span className={styles.badges}>{badges(single)}</span>
                            {readOnly ? null : (
                                <div className={styles.actions}>
                                    <Button
                                        icon={Crop}
                                        variant={
                                            (cropRequired &&
                                                single.transform?.crop === undefined) ||
                                            single.mediaChanged === true
                                                ? 'primary'
                                                : undefined
                                        }
                                        onPress={() => setEditing({ index: 0 })}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        icon={Images}
                                        onPress={() => {
                                            setReplacing(0);
                                            setPicking(true);
                                        }}
                                    >
                                        Replace
                                    </Button>
                                    <IconButton
                                        icon={Trash2}
                                        label={`Remove ${single.image.label}`}
                                        variant="ghost"
                                        onPress={() => setValue([])}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <ul className={styles.gallery}>
                        {value.map((entry, index) => (
                            <li key={`${entry.image.id}-${String(index)}`} className={styles.tile}>
                                <ImagePreview
                                    image={entry.image}
                                    base={entry.base ?? 'media'}
                                    transform={entry.transform ?? {}}
                                    fit="slice"
                                    label={entry.image.label}
                                    className={styles.tilePreview}
                                />
                                <span className={styles.tileName}>{entry.image.label}</span>
                                <span className={styles.badges}>{badges(entry)}</span>
                                {readOnly ? null : (
                                    <span className={styles.tileActions}>
                                        <IconButton
                                            icon={Crop}
                                            size="sm"
                                            label={`Edit ${entry.image.label}`}
                                            onPress={() => setEditing({ index })}
                                        />
                                        <IconButton
                                            icon={Trash2}
                                            size="sm"
                                            variant="ghost"
                                            label={`Remove ${entry.image.label}`}
                                            onPress={() =>
                                                setValue(value.filter((_, at) => at !== index))
                                            }
                                        />
                                    </span>
                                )}
                            </li>
                        ))}
                        {readOnly ? null : (
                            <li className={styles.addTile}>
                                <Button
                                    icon={Plus}
                                    variant="ghost"
                                    onPress={() => {
                                        setReplacing(null);
                                        setPicking(true);
                                    }}
                                >
                                    Add images
                                </Button>
                            </li>
                        )}
                    </ul>
                )}
            </Fieldset>
            <MediaPicker
                isOpen={picking}
                onOpenChange={setPicking}
                sources={[source]}
                multiple={multiple && replacing === null}
                accept={['image/*']}
                title={multiple ? 'Add images' : 'Choose image'}
                confirmLabel={cropRequired && !multiple ? 'Next: crop' : 'Select'}
                value={value.map((entry) => ({ id: entry.image.id, resource: 'images' }))}
                onSelect={(references) =>
                    pick(
                        references.flatMap(
                            (reference) => library.find((image) => image.id === reference.id) ?? [],
                        ),
                    )
                }
            />
            {editing !== null
                ? 'index' in editing
                    ? (() => {
                          const entry = value[editing.index];
                          return entry !== undefined ? editorFor(entry, entry.image) : null;
                      })()
                    : editorFor(null, editing.picked)
                : null}
        </>
    );
}
