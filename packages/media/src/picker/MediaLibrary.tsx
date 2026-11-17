import styles from './MediaPicker.module.css';
import type { MediaLibraryProps } from './types';
import { useMediaLibrary } from './useMediaLibrary';

/**
 * The library of the picker in a page (decision 0080): the libraries given as sources, their
 * search, type filter, sorts and filters, the details of the media chosen, which edit the
 * source's `fields`, and the uploads, with nothing to pick. Its grid scrolls with the page, and
 * its details stay in view beside it. `MediaPicker` is the same library in a dialog that picks.
 */
export function MediaLibrary({
    'aria-label': ariaLabel,
    className,
    ...options
}: MediaLibraryProps) {
    const library = useMediaLibrary({ ...options, selectable: false, scroll: 'page' });
    if (library.source === null) {
        return null;
    }
    return (
        <section
            aria-label={ariaLabel ?? library.source.label}
            className={[styles.library, className].filter(Boolean).join(' ')}
        >
            {library.switcher !== null ? (
                <div className={styles.libraryHeader}>{library.switcher}</div>
            ) : null}
            {library.tabs}
            {library.unsaved}
        </section>
    );
}
