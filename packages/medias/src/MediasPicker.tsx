/* eslint-disable react/jsx-props-no-spreading */
import { useMemo } from 'react';

import type { Media } from '@panneau/core';

import MediasBrowser from './MediasBrowser';

type PickerSelection = Media | Media[] | null;

interface MediasPickerProps {
    items?: Media[] | null;
    value?: PickerSelection;
    onChange?: ((selection: PickerSelection) => void) | null;
    multiple?: boolean;
    className?: string | null;
    [key: string]: unknown;
}

function MediasPicker({
    items: initialItems = null,
    value: initialSelectedItems = null,
    onChange,
    multiple = false,
    className = null,
    ...props
}: MediasPickerProps) {
    // Keep the previous selection on top of first page
    const extraItems = useMemo<Media[] | null>(() => {
        if (initialSelectedItems === null) {
            return null;
        }
        return Array.isArray(initialSelectedItems) ? initialSelectedItems : [initialSelectedItems];
    }, []);

    // const [selectedItems, setSelectedItems] = useState<PickerSelection>(
    //     initialSelectedItems || null,
    // );
    // const onSelectionChange = useCallback(
    //     (newSelection: PickerSelection) => {
    //         setSelectedItems(newSelection);
    //     },
    //     [setSelectedItems],
    // );
    // // Sync from the top
    // useEffect(() => {
    //     setSelectedItems(initialSelectedItems);
    // }, [initialSelectedItems, setSelectedItems]);
    // useEffect(() => {
    //     if (onChange !== null) {
    //         onChange(selectedItems);
    //     }
    // }, [selectedItems, onChange]);

    return (
        <div className={className}>
            <MediasBrowser
                items={initialItems} // TODO: fix useItems if actually using this
                selectable
                selectedItems={initialSelectedItems}
                onSelectionChange={onChange}
                multipleSelection={multiple}
                extraItems={extraItems}
                {...props}
            />
        </div>
    );
}

export default MediasPicker;
