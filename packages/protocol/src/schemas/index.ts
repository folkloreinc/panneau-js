import { z } from 'zod';

import { Action, ActionConfirm, ActionPlacement, ActionScope } from './action';
import {
    ActionItemResult,
    ActionRequest,
    ActionResult,
    ActionRun,
    ActionRunResponse,
    AddressValue,
    ContextOptionsResponse,
    CursorPagination,
    EmbedResponse,
    EmbedValue,
    FieldCheckRequest,
    FieldCheckResponse,
    Item,
    ItemResponse,
    LinkValue,
    ListResponse,
    LocationValue,
    MediaInfo,
    MediaItem,
    MediaReference,
    MediaTransform,
    Pagination,
    Passkey,
    PreviewResponse,
    Problem,
    RecoveryCodes,
    SearchResponse,
    Selection,
    Session,
    StoredFile,
    TwoFactorChallenge,
    TwoFactorSetup,
    TwoFactorStatus,
    Upload,
    UploadReference,
    UploadResponse,
    UploadSignRequest,
    UploadSignResponse,
    WebAuthnOptions,
} from './api';
import { Abilities, Condition, Id, Option, RouteReference } from './common';
import {
    Auth,
    AuthProvider,
    AuthToken,
    ContextOption,
    ContextParam,
    Definition,
    DefinitionContext,
    MenuItem,
    Page,
    Uploads,
    User,
    Widget,
} from './definition';
import {
    AddressSettings,
    BlockType,
    Field,
    LinkSettings,
    LinkTypeSetting,
    RichTextSettings,
    RichTextStyle,
    Rule,
} from './field';
import { actionJsonRules } from './jsonRules';
import { LayoutNode } from './layout';
import { Column, Filter, ListCalendar, ListDefinition } from './list';
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
    RichTextStyle,
    RichTextSettings,
    LinkTypeSetting,
    LinkSettings,
    AddressSettings,
    LayoutNode,
    Column,
    Filter,
    ListCalendar,
    ListDefinition,
    ActionScope,
    ActionPlacement,
    ActionConfirm,
    Action,
    ResourceFeatures,
    Resource,
    User,
    AuthProvider,
    AuthToken,
    Auth,
    MenuItem,
    Page,
    Widget,
    Uploads,
    ContextOption,
    ContextParam,
    DefinitionContext,
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
    CursorPagination,
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
    FieldCheckRequest,
    FieldCheckResponse,
    MediaInfo,
    MediaItem,
    MediaReference,
    Session,
    TwoFactorChallenge,
    TwoFactorStatus,
    TwoFactorSetup,
    RecoveryCodes,
    WebAuthnOptions,
    Passkey,
    SearchResponse,
    ContextOptionsResponse,
    PreviewResponse,
    EmbedValue,
    EmbedResponse,
    LocationValue,
    AddressValue,
    LinkValue,
} satisfies Record<string, z.ZodType>;

/** A registry of the named schemas, used to reference them by name in generated files. */
export function createSchemaRegistry() {
    const registry = z.registry<{ id: string } & Record<string, unknown>>();
    Object.entries(namedSchemas).forEach(([id, schema]) => registry.add(schema, { id }));
    // Checks that Zod makes in code, which the JSON Schema of the definition must make too.
    registry.add(Action, { id: 'Action', ...actionJsonRules });
    return registry;
}
