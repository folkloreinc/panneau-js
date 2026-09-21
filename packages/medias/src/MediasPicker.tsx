import type { Media } from '@panneau/core';

import MediasBrowser, { MediasBrowserProps } from './MediasBrowser';
import { useMediasBrowserContext } from './MediasBrowserContext';

export interface MediasPickerProps extends MediasBrowserProps {
    items?: Media[] | null;
    value?: Media[] | null;
    onChange?: ((selection: Media[] | null) => void) | null;
    multiple?: boolean;
}

function MediasPicker({
    items: initialItems = null,
    value: initialSelectedItems = null,
    onChange,
    multiple = false,
    ...props
}: MediasPickerProps) {
    return (
        <MediasBrowser
            items={initialItems} // TODO: fix useItems if actually using this
            selectable
            selectedItems={initialSelectedItems}
            onSelectionChange={onChange}
            multipleSelection={multiple}
            extraItems={initialSelectedItems}
            {...props}
        />
    );
}

export default MediasPicker;
