import { mediaMessages as messages } from '@panneau/intl';
import { Button, Dialog, Text, usePanneauIntl } from '@panneau/ui';

import styles from './MediaPicker.module.css';
import type { MediaPickerProps } from './types';
import { type Picked, toReference, useMediaLibrary } from './useMediaLibrary';

/**
 * The media picker (decision 0027): browse the libraries given as sources, upload to them, and
 * pick one media, or several with `multiple`. It returns references with their library
 * (`resource`). The `media` field opens it, and so can a product's own screens, with their
 * sources, title and button. Its library is `MediaLibrary`'s, in a dialog.
 */
export function MediaPicker(props: MediaPickerProps) {
    // A new picker each time it opens: its selection and tabs start over, while `stateKey` keeps
    // what the user browsed.
    if (!props.isOpen) {
        return null;
    }
    return <OpenMediaPicker {...props} />;
}

function OpenMediaPicker({
    onOpenChange,
    title,
    confirmLabel,
    confirmOnUpload = false,
    onSelect,
    isOpen: _isOpen,
    ...options
}: MediaPickerProps) {
    const intl = usePanneauIntl();
    const multiple = options.multiple ?? false;
    const confirm = (entries: readonly Picked[]) => {
        onSelect(entries.map(toReference));
        onOpenChange(false);
    };
    const library = useMediaLibrary({
        ...options,
        selectable: true,
        scroll: 'self',
        confirmOnUpload,
        onCreated: (entry) => {
            if (!multiple && confirmOnUpload) {
                confirm([entry]);
                return true;
            }
            return false;
        },
    });
    if (library.source === null) {
        return null;
    }
    const label =
        typeof confirmLabel === 'function'
            ? confirmLabel(library.picked.length)
            : (confirmLabel ?? intl.formatMessage(messages.pickerSelect));

    return (
        <Dialog
            isOpen
            onOpenChange={onOpenChange}
            title={title ?? intl.formatMessage(messages.pickerTitle)}
            size="xl"
            fullScreenOnPhone
            className={styles.dialog}
            bodyClassName={styles.body}
            headerContent={library.switcher}
            footer={
                <div className={styles.footer}>
                    <div className={styles.summary} aria-live="polite">
                        {library.picked.length === 0 ? (
                            <Text muted size="sm" as="span">
                                {intl.formatMessage(messages.pickerNothingSelected)}
                            </Text>
                        ) : multiple ? (
                            <>
                                <Text size="sm" weight="medium" as="span">
                                    {library.pickedSources > 1
                                        ? intl.formatMessage(messages.pickerSelectedIn, {
                                              count: library.picked.length,
                                              libraries: library.pickedSources,
                                          })
                                        : intl.formatMessage(messages.pickerSelectedCount, {
                                              count: library.picked.length,
                                          })}
                                </Text>
                                <Button size="sm" appearance="ghost" onPress={library.clear}>
                                    {intl.formatMessage(messages.pickerClear)}
                                </Button>
                            </>
                        ) : (
                            <Text size="sm" as="span" truncate>
                                {intl.formatMessage(messages.pickerSelected, {
                                    name: library.picked[0]?.item.label ?? '',
                                })}
                            </Text>
                        )}
                    </div>
                    <div className={styles.actions}>
                        <Button className={styles.cancel} onPress={() => onOpenChange(false)}>
                            {intl.formatMessage(messages.pickerCancel)}
                        </Button>
                        <Button
                            tone="accent"
                            isDisabled={library.picked.length === 0 || library.unchanged}
                            onPress={() => confirm(library.picked)}
                        >
                            {label}
                        </Button>
                    </div>
                </div>
            }
        >
            {library.tabs}
            {library.unsaved}
        </Dialog>
    );
}
