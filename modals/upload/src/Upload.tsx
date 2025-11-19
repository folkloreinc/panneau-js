/* eslint-disable react/jsx-props-no-spreading */
import Dashboard from '@uppy/react/dashboard';
import React from 'react';

import Dialog from '@panneau/modal-dialog';

import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';

// import '@uppy/react/css/style.css';

interface UploadModalProps {
    id: string | number;
    title?: string | null;
    uppy?: uppy | null;
    plugins?: string[];
    onClose?: (() => void) | null;
}

const DEFAULT_PLUGINS: string[] = [];

function UploadModal({
    id,
    title = null,
    uppy = null,
    plugins = DEFAULT_PLUGINS,
    onClose = null,
    ...props
}: UploadModalProps) {
    return (
        <Dialog id={id} size="lg" onClose={onClose} title={title}>
            {uppy !== null ? (
                <Dashboard
                    inline
                    width="100%"
                    height="350px"
                    showAddFilesPanel
                    proudlyDisplayPoweredByUppy={false}
                    {...props}
                    uppy={uppy}
                    onRequestClose={onClose}
                    plugins={plugins}
                />
            ) : null}
        </Dialog>
    );
}

export default UploadModal;
