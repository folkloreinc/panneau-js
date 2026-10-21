import { z } from 'zod';

import { Action, ActionConfirm, ActionPlacement, ActionScope } from './action';
import {
    ActionItemResult,
    ActionRequest,
    ActionResult,
    ActionRun,
    ActionRunResponse,
    Item,
    ItemResponse,
    ListResponse,
    Media,
    MediaListResponse,
    MediaResponse,
    MediaTransform,
    Pagination,
    PreviewResponse,
    Problem,
    SearchResponse,
    Selection,
    Session,
    StoredFile,
    Upload,
    UploadReference,
    UploadResponse,
    UploadSignRequest,
    UploadSignResponse,
} from './api';
import { Abilities, Condition, Id, Option, RouteReference } from './common';
import {
    Auth,
    AuthProvider,
    Definition,
    MenuItem,
    Page,
    Uploads,
    User,
    Widget,
} from './definition';
import { BlockType, Field, Rule } from './field';
import { LayoutNode } from './layout';
import { Column, Filter, ListDefinition } from './list';
import { Resource, ResourceFeatures } from './resource';
import {
    DefinitionTheme,
    Theme,
    ThemeFont,
    ThemeFontFace,
    ThemeFontStylesheet,
    ThemeTokens,
    ToneInput,
    ToneValues,
} from './theme';

export * from './common';
export * from './field';
export * from './layout';
export * from './list';
export * from './action';
export * from './resource';
export * from './theme';
export * from './definition';
export * from './api';
export * from './boot';

/** The named schemas of the protocol, as they appear in the generated JSON Schema and OpenAPI files. */
export const namedSchemas = {
    Id,
    Abilities,
    RouteReference,
    Condition,
    Option,
    Rule,
    BlockType,
    Field,
    LayoutNode,
    Column,
    Filter,
    ListDefinition,
    ActionScope,
    ActionPlacement,
    ActionConfirm,
    Action,
    ResourceFeatures,
    Resource,
    User,
    AuthProvider,
    Auth,
    MenuItem,
    Page,
    Widget,
    Uploads,
    ThemeTokens,
    ToneValues,
    ToneInput,
    ThemeFontFace,
    ThemeFontStylesheet,
    ThemeFont,
    Theme,
    DefinitionTheme,
    Definition,
    Item,
    Pagination,
    ItemResponse,
    ListResponse,
    Problem,
    Selection,
    ActionRequest,
    ActionItemResult,
    ActionResult,
    ActionRun,
    ActionRunResponse,
    MediaTransform,
    StoredFile,
    UploadReference,
    Upload,
    UploadResponse,
    UploadSignRequest,
    UploadSignResponse,
    Media,
    MediaResponse,
    MediaListResponse,
    Session,
    SearchResponse,
    PreviewResponse,
} satisfies Record<string, z.ZodType>;

/** A registry of the named schemas, used to reference them by name in generated files. */
export function createSchemaRegistry() {
    const registry = z.registry<{ id: string }>();
    Object.entries(namedSchemas).forEach(([id, schema]) => registry.add(schema, { id }));
    return registry;
}
