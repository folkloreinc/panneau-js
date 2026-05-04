import Dashboard from '@uppy/react/dashboard';
import { useCallback, useState } from 'react';

import Dialog from '@panneau/modal-dialog';

import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';

// import '@uppy/react/css/style.css';

interface UploadModalProps {
    id: string | number;
    title?: string | null;
    uppy?: uppy | null;
    plugins?: string[];
    onClosed?: (() => void) | null;
}

const DEFAULT_PLUGINS: string[] = [];

function UploadModal({
    id,
    title = null,
    uppy = null,
    plugins = DEFAULT_PLUGINS,
    onClosed = null,
    ...props
}: UploadModalProps) {
    const [opened, setOpened] = useState(true);
    const requestClose = () => {
        setOpened(false);
    };
    return (
        <Dialog
            id={id}
            title={title}
            size="lg"
            visible={opened}
            onClosed={onClosed}
            requestClose={requestClose}
        >
            {uppy !== null ? (
                <Dashboard
                    inline
                    width="100%"
                    height="350px"
                    showAddFilesPanel
                    proudlyDisplayPoweredByUppy={false}
                    {...props}
                    uppy={uppy}
                    onRequestClose={requestClose}
                    plugins={plugins}
                />
            ) : null}
        </Dialog>
    );
}

export default UploadModal;
