import { type ComponentType, type ReactNode, createContext, use } from 'react';

import type { Form } from '@panneau/core';
import type { Field, LayoutNode } from '@panneau/protocol';

import { ErrorSummary } from '../ErrorSummary';
import styles from '../Form.module.css';
import { SaveContext, SaveControls, SummaryContext } from './SaveControls';

/**
 * What the component of a panel of a form's sidebar gets (decision 0075), with the `props` of its
 * node: a `sidebar` node with a `panel`. Its title is the node's `label`, which the aside shows.
 */
export interface FormPanelProps {
    node: LayoutNode;
    form: Form;
    /** The fields of the form, by name. */
    fields: ReadonlyMap<string, Field>;
    /** The node's children, rendered: the fields the panel holds. */
    children: ReactNode;
}

/** A component of a panel: built in, of a plugin, or of `Form`'s `panels`. */
export type FormPanelComponent = ComponentType<FormPanelProps>;

/**
 * The `save` panel: the state of the form, its actions and its Save button. It shows beside the
 * form only, where the form has no footer (decision 0075).
 */
export function SavePanel(): ReactNode {
    const save = use(SaveContext);
    if (save === null) {
        return null;
    }
    return (
        <div className={styles.savePanel}>
            <SaveControls {...save} />
        </div>
    );
}

/**
 * The `errors` panel: the errors of the form after a failed save, each a link to its field. It
 * shows beside the form only, where the form has no summary at the top (decision 0075).
 */
export function ErrorsPanel(): ReactNode {
    const summary = use(SummaryContext);
    if (summary === null) {
        return null;
    }
    return (
        <ErrorSummary errors={summary.errors} fields={summary.fields} onSelect={summary.onSelect} />
    );
}

/** The panels of `@panneau/forms`, which plugins and `Form`'s `panels` can override. */
export const builtInPanels: Readonly<Record<string, FormPanelComponent>> = {
    save: SavePanel,
    errors: ErrorsPanel,
};

/** The panels of a form, by name: built in, then of plugins, then of `Form`'s `panels`. */
export const PanelsContext = createContext<ReadonlyMap<string, FormPanelComponent>>(
    new Map(Object.entries(builtInPanels)),
);

/** The panels that show only beside the form: below it, the footer and the summary do their work. */
export const BESIDE_ONLY_PANELS: ReadonlySet<string> = new Set(['save', 'errors']);
