import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DashboardModal } from '@uppy/react';

import { useUppy } from '@panneau/core/contexts';

import './styles.scss';

const propTypes = {
    opened: PropTypes.bool,
    sources: PropTypes.arrayOf(PropTypes.string),
    onUploaded: PropTypes.func,
    onRequestClose: PropTypes.func,
};

const defaultProps = {
    opened: false,
    sources: ['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive'],
    onUploaded: null,
    onRequestClose: null,
};

const UploadModal = ({ opened, sources, onUploaded, onRequestClose }) => {
    const onUppyComplete = useCallback(
        (response) => {
            if (onUploaded !== null) {
                onUploaded(response);
            }
        },
        [onUploaded],
    );

    const uppy = useUppy({
        onComplete: onUppyComplete,
        sources,
    });

    useEffect(() => {
        if (uppy !== null && !opened) {
            uppy.reset();
        }
    }, [uppy, opened]);

    return uppy !== null ? (
        <DashboardModal
            uppy={uppy}
            open={opened}
            closeAfterFinish
            onRequestClose={onRequestClose}
            plugins={sources}
        />
    ) : null;
};

UploadModal.propTypes = propTypes;
UploadModal.defaultProps = defaultProps;

export default UploadModal;
