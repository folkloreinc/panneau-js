import type { Media } from '@panneau/core';

import MediasBrowser from './MediasBrowser';

interface MediasPickerProps {
    items?: Media[] | null;
    value?: Media[] | null;
    onChange?: ((selection: Media[] | null) => void) | null;
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
    return (
        <div className={className}>
            <MediasBrowser
                items={initialItems} // TODO: fix useItems if actually using this
                selectable
                selectedItems={initialSelectedItems}
                onSelectionChange={onChange}
                multipleSelection={multiple}
                extraItems={initialSelectedItems}
                {...props}
            />
        </div>
    );
}

export default MediasPicker;
