// The options and the report of the conformance kit.
export interface ConformanceOptions {
    /** Base URL of the API, the same as `api.baseUrl` of the definition, but absolute. */
    baseUrl: string;
    /** The `fetch` to use. Defaults to the global one. */
    fetch?: (input: string, init?: RequestInit) => Promise<Response>;
    /** Merged into every request, for authentication headers or cookies. */
    init?: RequestInit;
    /** Resource to test. Defaults to the first resource of the definition. */
    resource?: string;
    /**
     * Values of the context (decision 0045), sent in `Panneau-Context` with every request: for a
     * backend whose resources need a value of a required param. The checks of the context use
     * them too, and the first choice of each param without one.
     */
    context?: Record<string, string>;
    /**
     * Enables the checks that write data, on the tested resource. Use a test database: these
     * checks create, update and delete an item.
     */
    writes?: {
        /** Valid values for a new item. */
        create: Record<string, unknown>;
        /** Valid values for an update. */
        update: Record<string, unknown>;
        /** Values that must be refused with a `422`. Defaults to `{}` when a field is required. */
        invalid?: Record<string, unknown>;
    };
}

export type ConformanceStatus = 'passed' | 'failed' | 'skipped';

export interface ConformanceCheck {
    id: string;
    title: string;
    status: ConformanceStatus;
    /** What went wrong, or why the check was skipped. */
    issues: string[];
}

export interface ConformanceReport {
    passed: boolean;
    checks: ConformanceCheck[];
}
