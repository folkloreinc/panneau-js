import type { ReactNode } from 'react';

import { FilePicker, UploadList, type UseUploadsResult, formatSize } from '@panneau/fields';
import { mediaMessages as messages } from '@panneau/intl';
import { Alert, Heading, Spinner, Text, usePanneauIntl } from '@panneau/ui';

import styles from './MediaPicker.module.css';
import { describeAccept } from './format';

export interface UploadPanelProps {
    library: string;
    multiple: boolean;
    confirmOnUpload: boolean;
    accept: readonly string[] | null;
    maxSize: number | null;
    upload: UseUploadsResult;
    /** Files refused before they were sent, and media that couldn't be made, with why. */
    problems: readonly string[];
    /** Names of the files being made media, once uploaded. */
    creating: readonly string[];
    /** The grid of the media the uploads made, which are selected. */
    uploaded: ReactNode;
}

/**
 * The Upload tab: a drop zone and a button, what the library accepts, the files refused with why,
 * the files being sent, and the media they became.
 */
export function UploadPanel({
    library,
    multiple,
    confirmOnUpload,
    accept,
    maxSize,
    upload,
    problems,
    creating,
    uploaded,
}: UploadPanelProps) {
    const intl = usePanneauIntl();
    const types =
        accept !== null && accept.length > 0
            ? describeAccept(accept, intl)
            : intl.formatMessage(messages.pickerAnyFile);
    return (
        <div className={styles.upload}>
            <div className={styles.dropZone}>
                <FilePicker accept={accept} multiple={multiple} onSelect={upload.add} />
                <Text size="sm" muted>
                    {maxSize !== null
                        ? intl.formatMessage(messages.pickerUploadAcceptsSize, {
                              types,
                              size: formatSize(maxSize, intl.locale),
                          })
                        : intl.formatMessage(messages.pickerUploadAccepts, { types })}{' '}
                    {intl.formatMessage(
                        confirmOnUpload && !multiple
                            ? messages.pickerUploadToConfirm
                            : messages.pickerUploadTo,
                        { library },
                    )}
                </Text>
            </div>
            {problems.length > 0 ? (
                <Alert tone="danger" role="alert" className={styles.problems}>
                    <ul className={styles.problemList}>
                        {problems.map((problem, index) => (
                            <li key={index}>{problem}</li>
                        ))}
                    </ul>
                </Alert>
            ) : null}
            {uploaded !== null ? (
                <section className={styles.uploaded} aria-labelledby="panneau-picker-uploaded">
                    <Heading level={3} size={4} id="panneau-picker-uploaded">
                        {intl.formatMessage(messages.pickerAddedTo, { library })}
                    </Heading>
                    {uploaded}
                </section>
            ) : null}
            {upload.items.length > 0 || creating.length > 0 ? (
                <div className={styles.sending}>
                    <UploadList
                        items={upload.items}
                        onPause={upload.pause}
                        onResume={upload.resume}
                        onCancel={upload.cancel}
                        onRetry={upload.retry}
                    />
                    {creating.length > 0 ? (
                        <span className={styles.creating} role="status">
                            <Spinner size="sm" />
                            {creating.join(', ')}
                        </span>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
