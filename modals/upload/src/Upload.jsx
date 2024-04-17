/* eslint-disable react/jsx-props-no-spreading */
import { Dashboard } from '@uppy/react';
import PropTypes from 'prop-types';
import React from 'react';

import Dialog from '@panneau/modal-dialog';

import styles from './styles.module.scss';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/drag-drop/dist/style.min.css';
import '@uppy/status-bar/dist/style.min.css';

const propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    uppy: PropTypes.shape({
        reset: PropTypes.func,
    }),
    plugins: PropTypes.arrayOf(PropTypes.string),
    onClose: PropTypes.func,
};

const defaultProps = {
    title: null,
    uppy: null,
    plugins: [],
    onClose: null,
};

const UploadModal = ({ id, title, uppy, plugins, onClose, ...props }) => (
    <Dialog id={id} size="lg" onClose={onClose} title={title}>
        {uppy !== null ? (
            <Dashboard
                inline
                width="100%"
                height="350px"
                showAddFilesPanel
                proudlyDisplayPoweredByUppy={false}
                {...props}
                className={styles.container}
                uppy={uppy}
                onRequestClose={onClose}
                plugins={plugins}
            />
        ) : null}
    </Dialog>
);

UploadModal.propTypes = propTypes;
UploadModal.defaultProps = defaultProps;

export default UploadModal;
