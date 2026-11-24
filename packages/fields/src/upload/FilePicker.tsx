import { Upload } from 'lucide-react';
import { DropZone, FileTrigger } from 'react-aria-components';

import { Button, isReorderDrag, usePanneauIntl } from '@panneau/ui';

import { cx } from '../shared/cx';
import { messages } from '../shared/messages';
import styles from './FilePicker.module.css';
import { readDrop } from './files';

export interface FilePickerProps {
    /** Called with the files chosen or dropped. */
    onSelect: (files: File[]) => void;
    /** Accepted MIME types, which the file dialog offers. */
    accept?: readonly string[] | null;
    multiple?: boolean;
    isDisabled?: boolean;
    /** Text of the button. Defaults to "Choose a file", or "Choose files" with `multiple`. */
    label?: string;
    /**
     * Whether the picker takes drops itself. Defaults to true. `false` inside a `FileDropZone`,
     * which takes them on the whole field.
     */
    isDroppable?: boolean;
    className?: string;
}

/** A button that opens the file dialog, in a zone where files can be dropped. */
export function FilePicker({
    onSelect,
    accept,
    multiple = false,
    isDisabled = false,
    label,
    isDroppable = true,
    className,
}: FilePickerProps) {
    const intl = usePanneauIntl();
    const content = (
        <>
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
        </>
    );
    if (!isDroppable) {
        return <div className={cx(styles.zone, className)}>{content}</div>;
    }
    return (
        <DropZone
            className={cx(styles.zone, className)}
            // Files only: not the items of a list that reorders them (decision 0111)
            getDropOperation={(types, allowed) =>
                isReorderDrag(types) ? 'cancel' : (allowed[0] ?? 'cancel')
            }
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
            {content}
        </DropZone>
    );
}
