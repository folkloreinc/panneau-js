/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import MediaCard from '@panneau/element-media-card';

import UploadField from './UploadField';

const propTypes = {
    value: PropTypes.shape({
        published: PropTypes.bool,
        featured: PropTypes.bool,
        created_at: PropTypes.string,
        updated_at: PropTypes.string,
    }),
    onChange: PropTypes.func,
    types: PropTypes.arrayOf(PropTypes.string),
    fileTypes: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    value: null,
    onChange: null,
    types: null,
    fileTypes: null,
};

const UpdateFileField = ({ value, onChange, ...props }) => {
    const [newValue, setNewValue] = useState(null);
    const [visibleFile, setVisibleFile] = useState(null);
    const { id: previousId, type = null } = value || {};

    const onUploadChange = useCallback(
        (uploadedFile = null) => {
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
                <UploadField
                    {...props}
                    {...uploadProps}
                    addButtonLabel={
                        <FormattedMessage defaultMessage="Edit file" description="Button label" />
                    }
                    allowMultipleUploads={false}
                    multiple={false}
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
};

UpdateFileField.propTypes = propTypes;
UpdateFileField.defaultProps = defaultProps;

export default UpdateFileField;
