// What the routes of a resource get.
import type { ContextValues } from '../context';
import type { ResourceInput } from '../schemas';
import type { Item } from '../schemas/api';
import type { Values } from './types';
import type { createMockUploads } from './uploads';

/** A request to the routes of a resource. */
export interface MockRoute {
    url: URL;
    /** The segments of the path after the base path, decoded. */
    segments: string[];
    method: string;
    readBody: () => Promise<Values>;
    /** The values of the context of the request. */
    context: ContextValues;
    /** The items of a resource in the context. */
    inScope: (resource: string, list: Item[]) => Item[];
    resource: ResourceInput;
    /** All the items of the resource. */
    list: Item[];
    /** The items of the resource in the context: those that requests read and act on. */
    scoped: Item[];
    /** The request itself, for its headers. */
    request: Request;
}

/** The uploads of a backend, for the routes that write values. */
export type MockFiles = Pick<ReturnType<typeof createMockUploads>, 'resolveValues'>;
