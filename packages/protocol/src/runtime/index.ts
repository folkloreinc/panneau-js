// `@panneau/protocol/runtime`: the constants of the protocol and the helpers that run in the
// browser (conditions, portable rules, values, list and search queries, problems, image transforms), without the schemas. It
// never imports zod, so that UI packages don't bundle it: `index.test.ts` checks it. Its types are
// those of the main entry point.
export { PROBLEM_CONTENT_TYPE, PROTOCOL_VERSION } from '../version';
export * from '../constants';
export {
    type CurrencyCode,
    CURRENCY_CODES,
    fromMinorUnits,
    getCurrencyDigits,
    isCurrencyCode,
    toMinorUnits,
} from '../currencies';
export { type CheckOptions, type RuleFailure, checkRules, checkValues } from '../rules';
export { evaluateCondition } from '../conditions';
export {
    POSTAL_CODE_COUNTRIES,
    getAddressRequiredParts,
    isAddressPart,
    isPostalCode,
    normalizePostalCode,
} from '../addresses';
export {
    type LinkNewTab,
    type LinkType,
    getLinkNewTab,
    getLinkTypes,
    isBuiltInLinkType,
    isExternalUrl,
    resolveLinkNewTab,
} from '../links';
export {
    type ItemImageResource,
    type MediaLibrariesDefinition,
    getItemImageField,
    getMediaLibraries,
} from '../libraries';
export { matchesRatio, parseRatio, renderedCropSize } from '../transforms';
export { lintDefinition } from '../lint';
export type { ValidationIssue } from '../validate';
export {
    type FilterRange,
    type FilterValue,
    type CursorPageMeta,
    type ListQuery,
    isCursorPage,
    fromSearchParams,
    isFilterRange,
    matchesFilterRange,
    toSearchParams,
} from '../query';
export {
    type ReadSearchQueryResult,
    type SearchQuery,
    type SearchableResource,
    SEARCH_DEFAULT_LIMIT,
    SEARCH_MAX_LENGTH,
    SEARCH_MAX_LIMIT,
    SEARCH_MIN_LENGTH,
    isSearchableResource,
    readSearchQuery,
    toSearchQueryParams,
} from '../search';
export { getValue, isFilled } from '../values';
export {
    type ContextValues,
    contextBefore,
    formatContextHeader,
    parseContextHeader,
} from '../context';
export { isProblem } from '../problem';
export { type PartialTheme, mergeThemes } from '../themes';
export {
    type BuiltInWidgetType,
    type WidgetResource,
    type WidgetSeriesPeriod,
    BUILT_IN_WIDGET_TYPES,
    RESOURCE_WIDGET_TYPES,
    WIDGET_LIST_MAX_ITEMS,
    WIDGET_RESERVED_QUERY_PARAMS,
    WIDGET_SERIES_PERIODS,
    checkWidgetData,
    getWidgetResource,
    isBuiltInWidgetType,
} from '../widgets';
