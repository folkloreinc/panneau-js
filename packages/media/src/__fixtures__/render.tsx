import { render } from '@testing-library/react';
import { type ReactElement, type ReactNode, useState } from 'react';

import { PanneauRoot } from '@panneau/ui';

/** Renders inside a PanneauRoot. */
export function renderInRoot(ui: ReactElement) {
    return render(<PanneauRoot>{ui}</PanneauRoot>);
}

/** Holds a value, like a form would, and reports every change. */
export function Controlled<V>({
    initial,
    onChange,
    children,
}: {
    initial: V;
    onChange?: (value: V) => void;
    children: (value: V, setValue: (value: V) => void) => ReactNode;
}) {
    const [value, setValue] = useState(initial);
    return children(value, (next) => {
        setValue(next);
        onChange?.(next);
    });
}

/** The file input of a picker. */
export function fileInput(container: HTMLElement): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (input === null) {
        throw new Error('No file input.');
    }
    return input;
}

export const file = (name: string, type: string, size = 10) =>
    new File([new Uint8Array(size)], name, { type });
