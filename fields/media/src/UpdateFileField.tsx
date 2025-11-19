/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import MediaCard from '@panneau/element-media-card';

import MediaField from './MediaField';

interface Media {
    id?: string | number;
    type?: string;
    published?: boolean;
    featured?: boolean;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

interface UpdateFileFieldProps {
    value?: Media | null;
    onChange?: ((value: Media | null) => void) | null;
    types?: string[] | null;
    fileTypes?: string[] | null;
    [key: string]: unknown;
}

function UpdateFileField({
    value = null,
    onChange = null,
    ...props
}: UpdateFileFieldProps) {
    const [newValue, setNewValue] = useState<Media | null>(null);
    const [visibleFile, setVisibleFile] = useState<Media | null>(null);
    const { id: previousId, type = null } = value || {};

    const onUploadChange = useCallback(
        (uploadedFile: Media | null = null) => {
            if (uploadedFile !== null) {
                setVisibleFile(uploadedFile);
            }
            setNewValue(uploadedFile);
        },
        [setNewValue, setVisibleFile],
    );

    const uppyProps = useMemo(() => ({ meta: { previousId } }), [previousId]);

    const uploadProps = useMemo(() => {
        if (type === 'image') {
            return {
                types: ['image'],
            };
        }
        if (type === 'audio') {
            return {
                types: ['audio'],
            };
        }
        if (type === 'video') {
            return {
                types: ['video'],
            };
        }
        if (type === 'document') {
            return {
                types: [],
                fileTypes: ['.pdf'],
            };
        }
        return null;
    }, [type]);

    return (
        <>
            <div className="mb-3">
                <MediaCard value={visibleFile || value} withoutDescription />
            </div>
            <div className="mb-3">
                <MediaField
                    {...props}
                    {...uploadProps}
                    addButtonLabel={
                        <FormattedMessage defaultMessage="Edit file" description="Button label" />
                    }
                    allowMultipleUploads={false}
                    linkPath="panneauUrl"
                    onChange={onUploadChange}
                    onClose={onUploadChange}
                    maxNumberOfFiles={1}
                    value={newValue}
                    withButton
                    uppyProps={uppyProps}
                />
            </div>
        </>
    );
}

export default UpdateFileField;
