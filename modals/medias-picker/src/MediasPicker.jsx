/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { MediasPicker } from '@panneau/medias';
import Dialog from '@panneau/modal-dialog';

const propTypes = {
    title: PropTypes.string,
    multiple: PropTypes.bool,
    onConfirm: PropTypes.func,
    onClose: PropTypes.func,
    onChange: PropTypes.func,
};

const defaultProps = {
    title: null,
    multiple: false,
    onConfirm: null,
    onClose: null,
    onChange: null,
};

function MediasPickerModal({ title, onClose, onChange, onConfirm, multiple, ...props }) {
    const onSelectionConfirm = useCallback(() => {
        if (onConfirm !== null) {
            onConfirm();
        }
        if (onClose !== null) {
            onClose();
        }
    }, [onConfirm]);
    return (
        <Dialog size="lg" onClose={onClose} title={title}>
            <MediasPicker
                {...props}
                onChange={onChange}
                onConfirm={onSelectionConfirm}
                onClose={onClose}
                multiple={multiple}
            />
        </Dialog>
    );
}

MediasPickerModal.propTypes = propTypes;
MediasPickerModal.defaultProps = defaultProps;

export default MediasPickerModal;
