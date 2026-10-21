import { Upload } from 'lucide-react';
import { type DropItem, DropZone, FileTrigger } from 'react-aria-components';

import { Button, usePanneauIntl } from '@panneau/ui';

import { cx } from '../shared/cx';
import { messages } from '../shared/messages';
import styles from './FilePicker.module.css';

export interface FilePickerProps {
    /** Called with the files chosen or dropped. */
    onSelect: (files: File[]) => void;
    /** Accepted MIME types, which the file dialog offers. */
    accept?: readonly string[] | null;
    multiple?: boolean;
    isDisabled?: boolean;
    /** Text of the button. Defaults to "Choose a file", or "Choose files" with `multiple`. */
    label?: string;
    className?: string;
}

async function readDrop(items: DropItem[]): Promise<File[]> {
    const files = await Promise.all(
        items.map((item) => (item.kind === 'file' ? item.getFile() : Promise.resolve(null))),
    );
    return files.filter((file): file is File => file !== null);
}

/** A button that opens the file dialog, in a zone where files can be dropped. */
export function FilePicker({
    onSelect,
    accept,
    multiple = false,
    isDisabled = false,
    label,
    className,
}: FilePickerProps) {
    const intl = usePanneauIntl();
    return (
        <DropZone
            className={cx(styles.zone, className)}
            aria-label={intl.formatMessage(messages.dropZone)}
            isDisabled={isDisabled}
            onDrop={(event) => {
                void readDrop(event.items).then((files) => {
                    if (files.length > 0) {
                        onSelect(multiple ? files : files.slice(0, 1));
                    }
                });
            }}
        >
            <FileTrigger
                {...(accept !== null && accept !== undefined && accept.length > 0
                    ? { acceptedFileTypes: accept }
                    : {})}
                allowsMultiple={multiple}
                onSelect={(list) => {
                    const files = list === null ? [] : [...list];
                    if (files.length > 0) {
                        onSelect(files);
                    }
                }}
            >
                <Button size="sm" appearance="outline" icon={Upload} isDisabled={isDisabled}>
                    {label ??
                        intl.formatMessage(multiple ? messages.chooseFiles : messages.chooseFile)}
                </Button>
            </FileTrigger>
            <span className={styles.hint}>{intl.formatMessage(messages.dropHere)}</span>
        </DropZone>
    );
}
