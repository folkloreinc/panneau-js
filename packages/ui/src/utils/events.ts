import type { SyntheticEvent } from 'react';

/** Stops an event from reaching the components around: for `onSubmit` of overlays. */
export function stopPropagation(event: SyntheticEvent): void {
    event.stopPropagation();
}
