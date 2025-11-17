/* eslint-disable react/jsx-props-no-spreading */
import Dashboard from '@uppy/react/dashboard';
import PropTypes from 'prop-types';
import React from 'react';

import Dialog from '@panneau/modal-dialog';

import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';

// import '@uppy/react/css/style.css';

const propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    uppy: PropTypes.shape({
        reset: PropTypes.func,
    }),
    plugins: PropTypes.arrayOf(PropTypes.string),
    onClose: PropTypes.func,
};

const DEFAULT_PLUGINS = [];

const UploadModal = ({
    id,
    title = null,
    uppy = null,
    plugins = DEFAULT_PLUGINS,
    onClose = null,
    ...props
}) => (
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

UploadModal.propTypes = propTypes;

export default UploadModal;
