import { createPanneauApp } from '@panneau/app';
import { createRestAdapter } from '@panneau/data';
import { editorPlugin } from '@panneau/editor';
import { createNominatimSource } from '@panneau/fields';
import { type MockMail, createMockBackend } from '@panneau/protocol/mock';

import { PUBLICATIONS, createPlaygroundDefinition, createPlaygroundItems } from './definition';
import { PagePreview, articlePreviewUrl } from './previews';
import { flatTheme } from './themes';

// The dev server answers every path with the page. A build can be served from any folder: its base
// path is where the page was first opened.
const basePath = import.meta.env.DEV
    ? '/'
    : (sessionStorage.getItem('panneau-playground-base') ??
      (window.location.pathname.replace(/\/(index\.html)?$/, '') || '/'));
sessionStorage.setItem('panneau-playground-base', basePath);

// `?theme=flat` shows the frame restyled through its tokens.
const theme =
    new URLSearchParams(window.location.search).get('theme') ??
    sessionStorage.getItem('panneau-playground-theme');
if (theme !== null) {
    sessionStorage.setItem('panneau-playground-theme', theme);
}

const definition = {
    ...createPlaygroundDefinition(),
    // Panneau's own login, with its password reset, email verification (decision 0048) and
    // two-factor authentication (decision 0049)
    auth: {
        mode: 'panneau' as const,
        passwordReset: true,
        emailVerification: true,
        twoFactor: true,
    },
    ...(theme === 'flat' ? { theme: { extends: 'flat' } } : {}),
};

/**
 * Opens the link of an email of the mock backend in place, a moment after it is "sent": its tokens
 * live in memory, and a reload would forget them.
 */
function openMail({ kind, to, path }: MockMail) {
    console.info(`[playground] The ${kind} email to ${to} links to ${path}`);
    window.setTimeout(() => {
        window.history.pushState(null, '', `${basePath.replace(/\/$/, '')}/${path}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }, 2000);
}

const backend = createMockBackend({
    definition,
    // Logged in as Ada. Log out to see the login page: every password is "panneau". Sam hasn't
    // verified their address yet, Grace logs in with two-factor authentication (code 123456,
    // or the recovery code grace-recovery), and Alan must set it up.
    auth: {
        users: [
            { email: 'ada@example.com', password: 'panneau', name: 'Ada Lovelace' },
            { email: 'sam@example.com', password: 'panneau', name: 'Sam', emailVerified: false },
            {
                email: 'grace@example.com',
                password: 'panneau',
                name: 'Grace Hopper',
                twoFactor: true,
                recoveryCodes: ['grace-recovery'],
            },
            {
                email: 'alan@example.com',
                password: 'panneau',
                name: 'Alan Turing',
                twoFactorRequired: true,
            },
        ],
        onMail: openMail,
    },
    items: createPlaygroundItems(),
    previewUrl: ({ item }) => articlePreviewUrl(item),
    context: {
        options: (name, before) =>
            name === 'desk'
                ? PUBLICATIONS.filter(
                      ({ id }) => before.publication === undefined || id === before.publication,
                  ).flatMap(({ id, label, desks }) =>
                      desks.map((desk) => ({
                          value: `${id}-${desk.toLowerCase()}`,
                          label: desk,
                          description: label,
                      })),
                  )
                : [],
        scope: (resource, item, values) =>
            resource !== 'articles' ||
            values.publication === undefined ||
            item.publication === values.publication,
    },
});

/**
 * The mock backend, with the queued runs of the `export` action of articles: each one counts to
 * its total, a step a second, so that the notification area of the shell has something to show.
 */
function withQueuedRuns(fetch: typeof backend.fetch): typeof backend.fetch {
    const runs = new Map<string, { startedAt: number; total: number; cancelled?: boolean }>();
    const reply = (status: number, body: unknown) =>
        Promise.resolve(
            new Response(JSON.stringify(body), {
                status,
                headers: { 'Content-Type': 'application/json' },
            }),
        );
    const runOf = (id: string) => {
        const { startedAt, total, cancelled = false } = runs.get(id) ?? { startedAt: 0, total: 0 };
        const progress = Math.min(total, Math.floor((Date.now() - startedAt) / 1000));
        const done = progress >= total;
        if (cancelled) {
            return {
                id,
                action: 'export',
                resource: 'articles',
                status: 'cancelled',
                progress,
                total,
            };
        }
        return {
            id,
            action: 'export',
            resource: 'articles',
            status: done ? 'succeeded' : progress > 0 ? 'running' : 'queued',
            progress,
            total,
            ...(done ? { result: { message: `${String(total)} articles exported.` } } : {}),
        };
    };
    return (input, init) => {
        const request = new Request(input, init);
        const path = new URL(request.url, window.location.href).pathname;
        const base = definition.api.baseUrl.replace(/\/$/, '');
        if (request.method === 'POST' && path === `${base}/resources/articles/actions/export`) {
            const id = `export-${String(runs.size + 1)}`;
            runs.set(id, { startedAt: Date.now(), total: 8 });
            return reply(202, { run: runOf(id) });
        }
        const run = /\/actions\/runs\/([^/]+)$/.exec(path)?.[1];
        if (run !== undefined && runs.has(run)) {
            if (request.method === 'DELETE') {
                const current = runs.get(run);
                if (current !== undefined) {
                    runs.set(run, { ...current, cancelled: true });
                }
                return Promise.resolve(new Response(null, { status: 204 }));
            }
            return reply(200, { run: runOf(run) });
        }
        return fetch(input, init);
    };
}

const element = document.getElementById('panneau');
if (element === null) {
    throw new Error('The page has no #panneau element.');
}

createPanneauApp({
    element,
    plugins: [
        editorPlugin,
        {
            id: 'playground',
            themes: { flat: flatTheme },
            previews: { page: PagePreview },
            // A command of the "Go to…" palette, as a project's plugin adds it.
            commands: [
                {
                    id: 'docs',
                    label: 'Panneau documentation',
                    group: 'Help',
                    keywords: ['help', 'docs'],
                    icon: 'book-open',
                    href: 'https://github.com/folkloreinc/panneau-js/tree/v5.x/docs',
                },
            ],
        },
    ],
    adapter: createRestAdapter({
        baseUrl: definition.api.baseUrl,
        fetch: withQueuedRuns(backend.fetch),
    }),
    // The address search of location fields, on OpenStreetMap's public geocoder
    maps: { geocoding: createNominatimSource() },
    config: {
        protocol: 1,
        apiBaseUrl: definition.api.baseUrl,
        basePath,
        locale: 'en',
        auth: definition.auth,
        definition,
    },
});
