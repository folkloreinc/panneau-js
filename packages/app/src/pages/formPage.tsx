import { type ReactNode, createContext, use } from 'react';

import type { ResolvedResource } from '@panneau/core';
import type { Item } from '@panneau/protocol';

import styles from './pages.module.css';

/** What a form page of the app knows, for the panels of its sidebar (decision 0075). */
export interface FormPage {
    /** The resource of the form, resolved. */
    resource: ResolvedResource;
    /** The item it edits, once loaded. `undefined` while it loads, and in a create form. */
    item: Item | undefined;
    /** Where the app is mounted, for links. */
    basePath: string;
    /** The locale of the definition. */
    locale: string;
}

interface FormPageContextValue extends FormPage {
    /** The actions of the item, as its page header shows them. */
    actions: ReactNode;
}

export const FormPageContext = createContext<FormPageContextValue | null>(null);

/**
 * The resource and the item of the form page that renders a component, such as a panel of its
 * sidebar that a plugin registers (decision 0075). `null` outside a form page of the app.
 */
export function useFormPage(): FormPage | null {
    const page = use(FormPageContext);
    if (page === null) {
        return null;
    }
    const { resource, item, basePath, locale } = page;
    return { resource, item, basePath, locale };
}

/**
 * The `actions` panel of a form's sidebar: the actions of its item, as its page header shows them
 * (duplicate, delete, its page on the site). The header then leaves them out (decision 0075).
 */
export function ActionsPanel(): ReactNode {
    const actions = use(FormPageContext)?.actions;
    return actions !== undefined && actions !== null ? (
        <div className={styles.panelActions}>{actions}</div>
    ) : null;
}
