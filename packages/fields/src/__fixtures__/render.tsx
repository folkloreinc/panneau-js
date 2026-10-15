import { render } from '@testing-library/react';
import { type ReactElement, type ReactNode, useState } from 'react';

import { PanneauRoot } from '@panneau/ui';

import { builtInFields } from '../shared/builtIn';
import { FieldsProvider, type FieldsProviderProps } from '../shared/context';

/** Renders inside a PanneauRoot, with the built-in fields. */
export function renderField(ui: ReactElement, options: Omit<FieldsProviderProps, 'children'> = {}) {
    return render(
        <PanneauRoot>
            <FieldsProvider components={builtInFields} {...options}>
                {ui}
            </FieldsProvider>
        </PanneauRoot>,
    );
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
