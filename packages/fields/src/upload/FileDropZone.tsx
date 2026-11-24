import type { ClipboardEvent, ReactNode } from 'react';
import { DropZone } from 'react-aria-components';

import { isReorderDrag, usePanneauIntl } from '@panneau/ui';

import { cx } from '../shared/cx';
import { messages } from '../shared/messages';
import styles from './FileDropZone.module.css';
import { readDrop } from './files';

export interface FileDropZoneProps {
    /** Called with the files dropped or pasted, all of them: the caller checks them. */
    onSelect: (files: File[]) => void;
    isDisabled?: boolean;
    /**
     * Takes the files pasted while the focus is inside the zone, except in a text input, where a
     * paste is text. Defaults to true.
     */
    acceptsPaste?: boolean;
    /** Name of the zone, for drops with the keyboard. Defaults to "Drop files here". */
    'aria-label'?: string;
    /** Shown over the zone, and announced, while files are dragged over it. Defaults to "Drop to upload". */
    dropLabel?: string;
    className?: string;
    children: ReactNode;
}

/** Whether a paste on this element is text: an input, a text area, a select or editable content. */
function isTextEntry(target: EventTarget): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    if (target.isContentEditable) {
        return true;
    }
    if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        return true;
    }
    return (
        target instanceof HTMLInputElement &&
        ![
            'button',
            'checkbox',
            'radio',
            'submit',
            'reset',
            'file',
            'image',
            'range',
            'color',
        ].includes(target.type)
    );
}

/**
 * A zone around a field's content where files can be dropped, anywhere on it, or pasted while the
 * focus is inside it. While files are dragged over it, it shows and announces where they go. It
 * gives every file to `onSelect`, which checks them as the field's button does (`useUploads()`).
 */
export function FileDropZone({
    onSelect,
    isDisabled = false,
    acceptsPaste = true,
    'aria-label': ariaLabel,
    dropLabel,
    className,
    children,
}: FileDropZoneProps) {
    const intl = usePanneauIntl();
    const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
        // A paste bubbles through portals: only the zone's own content counts, not its dialogs.
        if (
            isDisabled ||
            !acceptsPaste ||
            !(event.target instanceof Node) ||
            !event.currentTarget.contains(event.target) ||
            isTextEntry(event.target)
        ) {
            return;
        }
        const files = [...event.clipboardData.files];
        if (files.length === 0) {
            return;
        }
        event.preventDefault();
        onSelect(files);
    };
    return (
        <div className={cx(styles.root, className)} onPaste={onPaste}>
            <DropZone
                className={styles.zone}
                // Files only: not the items of a list that reorders them (decision 0111)
                getDropOperation={(types, allowed) =>
                    isReorderDrag(types) ? 'cancel' : (allowed[0] ?? 'cancel')
                }
                aria-label={ariaLabel ?? intl.formatMessage(messages.dropZone)}
                isDisabled={isDisabled}
                onDrop={(event) => {
                    void readDrop(event.items).then((files) => {
                        if (files.length > 0) {
                            onSelect(files);
                        }
                    });
                }}
            >
                {({ isDropTarget }) => (
                    <>
                        {children}
                        <span className={styles.overlay} role="status">
                            {isDropTarget
                                ? (dropLabel ?? intl.formatMessage(messages.dropToUpload))
                                : null}
                        </span>
                    </>
                )}
            </DropZone>
        </div>
    );
}
