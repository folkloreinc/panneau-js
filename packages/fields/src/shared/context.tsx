import { type ComponentType, type ReactNode, createContext, use } from 'react';

import type { Field } from '@panneau/protocol';

import type { UploadSource } from '../upload/types';
import type { RelationSource } from './relation';
import type { FieldEntry } from './types';

/** What a binding gives a field: its value, handlers and errors at a path. */
export interface BoundFieldProps {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur?: () => void;
    errors?: readonly string[];
}

/** Props of a binding: it decides whether a field shows, and where its value comes from. */
export interface FieldBindingProps {
    field: Field;
    /** Dot path of the field's value. */
    path: string;
    /** Dot path of the object the field belongs to: `''` at the top, `blocks.2` in a block. */
    parentPath: string;
    /** Renders the field with its bound value. */
    render: (bound: BoundFieldProps) => ReactNode;
}

/**
 * Binds nested fields (in groups, blocks and localized values) to a store by path, instead of the
 * value and `onChange` of their parent. `@panneau/forms` binds them to its form state, so that
 * every value is set, validated and shown in error by its own path.
 */
export type FieldBinding = ComponentType<FieldBindingProps>;

export interface FieldsContextValue {
    /** Registry entries, by field type, over the built-in ones. */
    components: Readonly<Record<string, FieldEntry>>;
    /** Locales of localized values, in order. */
    locales: readonly string[];
    /** Where relation fields search for items. */
    relationSource: RelationSource | null;
    /**
     * Where fields that take files upload them directly to storage. Without one, they give the
     * files themselves.
     */
    uploadSource: UploadSource | null;
    binding: FieldBinding | null;
}

const FieldsContext = createContext<FieldsContextValue>({
    components: {},
    locales: [],
    relationSource: null,
    uploadSource: null,
    binding: null,
});

/** The fields context of the closest `FieldsProvider`. */
export function useFieldsContext(): FieldsContextValue {
    return use(FieldsContext);
}

export interface FieldsProviderProps {
    /** Registry entries by type, added over those of a parent provider. */
    components?: Readonly<Record<string, FieldEntry>>;
    locales?: readonly string[];
    relationSource?: RelationSource | null;
    /** Make it once, outside of render: fields make an uploader for each source they get. */
    uploadSource?: UploadSource | null;
    binding?: FieldBinding | null;
    children?: ReactNode;
}

/**
 * Provides what fields rendered from a definition need: the components of each type, the locales
 * of localized values, a relation source, an upload source and a binding. Values not given come from the parent
 * provider.
 */
export function FieldsProvider({
    components,
    locales,
    relationSource,
    uploadSource,
    binding,
    children,
}: FieldsProviderProps) {
    const parent = use(FieldsContext);
    const value: FieldsContextValue = {
        components:
            components !== undefined ? { ...parent.components, ...components } : parent.components,
        locales: locales ?? parent.locales,
        relationSource: relationSource === undefined ? parent.relationSource : relationSource,
        uploadSource: uploadSource === undefined ? parent.uploadSource : uploadSource,
        binding: binding === undefined ? parent.binding : binding,
    };
    return <FieldsContext value={value}>{children}</FieldsContext>;
}

/** The parent path of a path: `blocks.2` for `blocks.2.title`, `''` for `title`. */
export function getParentPath(path: string): string {
    const index = path.lastIndexOf('.');
    return index === -1 ? '' : path.slice(0, index);
}
