// The options of the mock backend, and what it gives.
import type { ContextValues } from '../context';
import type { WidgetListQuery } from '../dashboards';
import type { WidgetPeriod } from '../periods';
import type { ContextOption, DefinitionInput } from '../schemas';
import type { EmbedValue, Item } from '../schemas/api';
import type { MockAuthOptions } from './auth';

/** The values of an item, as requests send them. */
export type Values = Record<string, unknown>;

export interface MockBackendOptions {
    /** The definition served by `GET /definition`. Its `api.baseUrl` is the prefix of every route. */
    definition: DefinitionInput;
    /** Initial values of the items, per resource id. Items without an `id` get one. */
    items?: Record<string, Values[]>;
    /**
     * The URL that `POST /resources/{resource}/{id}/preview` returns, for the item with the posted
     * values. Defaults to a `data:` URL of a plain page with the item's values.
     */
    previewUrl?: (context: { resource: string; item: Item }) => string;
    /**
     * The value of `GET /embeds?url=` for a URL, or `null` to refuse it with a `422`. Defaults to
     * a video for YouTube and Vimeo URLs, and a link for other web pages.
     */
    embed?: (url: string) => EmbedValue | null;
    /**
     * The current context, when the definition has `context` (decision 0045). The values of the
     * `Panneau-Context` header are checked against the choices of each param: a value that isn't
     * one is a `403` problem.
     */
    context?: MockContextOptions;
    /**
     * Users and a session, for the `panneau` auth mode: the auth routes answer, guests get a `401`
     * on the other routes, and with `auth.emailVerification`, users whose address isn't verified
     * get its `403` problem (decision 0048). Without it, every request is the user's.
     */
    auth?: MockAuthOptions;
    /**
     * The data of `GET /dashboard/widgets/{widget}?page={page}`, per widget id (decision 0064): the
     * data, a function that returns it for the current context and page, or a `Response` to answer
     * as is (a `403`, a slow or failing widget). It answers the widgets of every dashboard page
     * (decision 0084), and those of the home page without `page`, and with `?resource={resource}`,
     * those of the summary of a resource, whose functions get the filters and the search of the
     * list. Data that doesn't have the shape of a built-in type is a `500` problem that names the
     * wrong keys, as a backend answers it. Widgets without data, built-in widgets on a resource, and
     * widgets that aren't on the page or in the summary are a `404`; `page` and `resource` together,
     * or a wrong period, are a `422`, and the summary of a resource that can't be listed a `403`.
     * Functions get the period of the overview (decision 0084).
     */
    widgets?: Record<string, MockWidget>;
    /**
     * Whether something else uses an item, so that it can't be deleted: `delete` skips it with
     * the reason `in_use`, and its `undo` leaves it out. Without it, no item is in use.
     */
    inUse?: (context: { resource: string; item: Item }) => boolean;
}

/** The data of a widget in the mock backend: its data, or what answers it. */
export type MockWidget =
    | Response
    | Record<string, unknown>
    | ((
          context: MockWidgetContext,
      ) => Response | Record<string, unknown> | Promise<Response | Record<string, unknown>>);

/** What the function of a widget of the mock backend gets. */
export interface MockWidgetContext {
    /** The values of the context of the request. */
    context: ContextValues;
    /**
     * The page of the dashboard of the widget: `home` without `page` in the request, `null` for a
     * widget of a summary.
     */
    page: string | null;
    /** The resource whose summary holds the widget, or `null` for a widget of a dashboard page. */
    resource: string | null;
    /** In a summary: the filters and the search of the list (`filter[…]`, `q`). Empty otherwise. */
    query: WidgetListQuery;
    /** The period of the overview (`period[option]`, `period[from]`, `period[to]`), or `null`. */
    period: WidgetPeriod | null;
    /** The current items of a resource, in the context. */
    items: (resource: string) => Item[];
}

/** How the mock backend answers the context of its definition (decision 0045). */
export interface MockContextOptions {
    /**
     * Every choice of a param without inline `options`, for the values of the params before it.
     * `GET /context/{name}/options?q=` gives the first 20 whose label matches `q`.
     */
    options?: (name: string, before: ContextValues) => ContextOption[];
    /** Whether an item of a resource is in the context, for lists, items, actions and search. */
    scope?: (resource: string, item: Item, values: ContextValues) => boolean;
}

export interface MockBackend {
    /** A `fetch`-compatible function that answers protocol requests. */
    fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
    /** The current items of a resource. */
    items: (resource: string) => Item[];
}
