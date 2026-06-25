import classNames from 'classnames';
import isArray from 'lodash-es/isArray';
import { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Label as LabelType, Media } from '@panneau/core';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import { MediaCards } from '@panneau/element-media-card';
import ModalPicker from '@panneau/modal-medias-picker';
import type { UseUppyOptions } from '@panneau/uppy';

import styles from './styles.module.css';

type MediaType = 'audio' | 'image' | 'video' | 'document';
type MediaSource = 'webcam' | 'facebook' | 'instagram' | 'dropbox' | 'google-drive';

export interface MediaFieldProps {
    resource?: string;
    value?: Media | Media[] | null;
    name?: string | null;
    types?: MediaType[];
    fileTypes?: string[] | null;
    sources?: MediaSource[];
    withClearButton?: boolean;
    withoutMedia?: boolean;
    buttonLabel?: LabelType | null;
    clearButtonLabel?: LabelType | null;
    multiple?: boolean;
    maxNumberOfFiles?: number;
    namePath?: string;
    thumbnailPath?: string;
    sizePath?: string;
    linkPath?: string | null;
    uppyConfig?: UseUppyOptions | null;
    disabled?: boolean;
    onChange?: ((value: Media | Media[] | null) => void) | null;
    onClickButton?: (() => void) | null;
    className?: string | null;
}

const DEFAULT_TYPES: MediaType[] = ['audio', 'image', 'video'];
const DEFAULT_SOURCES: MediaSource[] = [
    'webcam',
    'facebook',
    'instagram',
    'dropbox',
    'google-drive',
];

function MediaField({
    resource = 'medias',
    value = null,
    name = null,
    types = DEFAULT_TYPES,
    fileTypes = null,
    sources = DEFAULT_SOURCES,
    withClearButton = false,
    withoutMedia = false,
    buttonLabel: initialButtonLabel = null,
    clearButtonLabel: initialClearButtonLabel = null,
    multiple = false,
    maxNumberOfFiles = 1,
    namePath = 'name',
    thumbnailPath = 'thumbnail_url',
    sizePath = 'metadata.size',
    linkPath = null,
    uppyConfig = null,
    disabled = false,
    onChange = null,
    onClickButton = null,
    className = null,
}: MediaFieldProps) {
    const buttonLabel = initialButtonLabel || (
        <FormattedMessage
            defaultMessage="Select media"
            description="Default media picker button label"
        />
    );
    const clearButtonLabel = initialClearButtonLabel || (
        <FormattedMessage defaultMessage="Clear" description="Default media clear button label" />
    );

    const finalUppyConfig = {
        maxNumberOfFiles: multiple && maxNumberOfFiles === 1 ? 50 : maxNumberOfFiles,
        ...uppyConfig,
        allowedFileTypes: fileTypes !== null ? fileTypes : types.map((type) => `${type}/*`),
        allowMultipleUploads: multiple,
        sources,
        autoProceed: true,
    };

    const onClickRemove = (idx: number) => {
        if (onChange !== null && isArray(value) && value.length > 1) {
            onChange(value.filter((v, i) => i !== idx));
        } else if (onChange !== null) {
            onChange(null);
        }
    };

    const modalKey = `media-field-${name}`;
    const [modalOpen, setModalOpen] = useState(false);

    const hasMedia = isArray(value) ? value.length > 0 : value !== null;

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const onModalChange = (newValue: Media | Media[] | null) => {
        if (onChange !== null) {
            onChange(newValue);
        }
    };

    const onClick = () => {
        if (onClickButton !== null) {
            onClickButton();
        } else {
            openModal();
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className={classNames([styles.container, { [className]: className !== null }])}
            ref={containerRef}
        >
            {!withoutMedia && hasMedia ? (
                <MediaCards
                    value={value}
                    namePath={namePath}
                    thumbnailPath={thumbnailPath}
                    sizePath={sizePath}
                    linkPath={linkPath}
                    disabled={disabled}
                    onClickRemove={onClickRemove}
                />
            ) : null}

            {!withoutMedia && hasMedia && withClearButton ? (
                <div className="row mt-2">
                    <div className="col-auto">
                        <Button
                            type="button"
                            theme="primary"
                            onClick={() => onChange?.(null)}
                            disabled={disabled}
                            outline
                        >
                            <Label>{clearButtonLabel}</Label>
                        </Button>
                    </div>
                </div>
            ) : null}

            {withoutMedia || !hasMedia || multiple ? (
                <div className="row mt-2">
                    <div className="col-auto">
                        <Button
                            type="button"
                            theme="primary"
                            onClick={onClick}
                            disabled={disabled}
                            outline
                        >
                            <Label>{buttonLabel}</Label>
                        </Button>
                    </div>
                </div>
            ) : null}

            {modalOpen ? (
                <ModalPicker
                    id={modalKey}
                    value={value}
                    resource={resource}
                    types={types}
                    selectable
                    onChange={onModalChange}
                    onClosed={closeModal}
                    uppyConfig={finalUppyConfig}
                    multiple={multiple}
                />
            ) : null}
        </div>
    );
}

export default MediaField;
