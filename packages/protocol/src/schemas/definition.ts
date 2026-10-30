import { z } from 'zod';

import { PROTOCOL_VERSION } from '../version';
import { Abilities, Id } from './common';
import { Resource } from './resource';
import { DefinitionTheme } from './theme';

export const User = z.looseObject({
    id: Id,
    name: z.string(),
    email: z.string().optional(),
    avatarUrl: z.string().optional(),
    abilities: Abilities.optional(),
    resource: z.string().optional().meta({
        description:
            'The resource of users: its item with this `id` is the profile of the user. Without it, clients look for a resource `users`.',
    }),
});

export const AuthProvider = z.looseObject({
    id: z.string().min(1),
    label: z.string(),
    url: z.string().optional().meta({ description: 'Where the login with this provider starts.' }),
    icon: z.string().optional(),
});

export const AuthToken = z.looseObject({
    label: z.string().optional().meta({ description: 'Label of the field. Defaults to "Token".' }),
    help: z.string().optional().meta({ description: 'Help under the field: where to find it.' }),
});

export const Auth = z.looseObject({
    mode: z.enum(['panneau', 'external']).meta({
        description: "`panneau`: Panneau's own login pages. `external`: the site handles login.",
    }),
    loginUrl: z
        .string()
        .nullable()
        .optional()
        .meta({ description: '`external`: where unauthenticated users are sent.' }),
    logoutUrl: z.string().nullable().optional().meta({
        description:
            "`external`: where the browser goes to log out, the site's own logout. Without it, the app offers no logout.",
    }),
    password: z.boolean().optional().meta({
        description:
            '`panneau`: a login with an email and a password. Defaults to true without `token`.',
    }),
    token: AuthToken.optional().meta({
        description:
            '`panneau`: a login with a single secret, such as an access token, sent as `token` to `POST /auth/login`.',
    }),
    providers: z.array(AuthProvider).optional(),
    passwordReset: z.boolean().optional(),
    twoFactor: z.boolean().optional(),
    passkeys: z.boolean().optional(),
    emailVerification: z.boolean().optional(),
});

export const MenuItem = z
    .looseObject({
        type: z.string().min(1).meta({
            description: 'Built-in: `resources`, `resource`, `page`, `link`, `separator`, `group`.',
        }),
        label: z.string().optional(),
        icon: z.string().optional(),
        resource: z.string().optional(),
        page: z.string().optional(),
        url: z.string().optional(),
        external: z.boolean().optional(),
        // The return type is written out so that declaration files keep the recursion.
        get children(): z.ZodOptional<z.ZodArray<typeof MenuItem>> {
            return z.array(MenuItem).optional();
        },
    })
    .meta({ description: 'An entry of a menu.' });

export const Page = z.looseObject({
    component: z
        .string()
        .min(1)
        .meta({ description: 'A page provided by a plugin, or a built-in page.' }),
    path: z.string().optional().meta({ description: 'Path of a custom page.' }),
    label: z.string().optional(),
    props: z.record(z.string(), z.unknown()).optional(),
});

export const Widget = z.looseObject({
    id: z.string().min(1),
    type: z.string().min(1).meta({
        description: 'Built-in: `stat`, `chart`, `recent-items`, `shortcuts`, `welcome`.',
    }),
    label: z.string().optional(),
    width: z.number().int().min(1).max(12).optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
});

export const Uploads = z.looseObject({
    mode: z.enum(['multipart', 'tus', 'presigned']).meta({
        description:
            '`multipart`: files go through `POST /media` and the requests that take them. `presigned`: the browser also sends files to storage itself, with URLs that `POST /uploads/sign` signs, then `POST /uploads/{upload}/complete` gives an upload that values reference.',
    }),
    endpoint: z.string().optional().meta({
        description:
            '`presigned`: the base URL of the upload routes, when they are not `{api.baseUrl}/uploads`.',
    }),
    maxSize: z.number().int().positive().optional(),
});

export const Definition = z
    .looseObject({
        protocol: z.literal(PROTOCOL_VERSION),
        name: z.string(),
        locale: z
            .string()
            .min(2)
            .meta({ description: 'BCP 47 locale of the labels and messages.' }),
        locales: z
            .array(z.string().min(2))
            .min(1)
            .meta({ description: 'Locales of localized content fields.' }),
        api: z.looseObject({ baseUrl: z.string() }),
        resources: z.array(Resource),
        pages: z.record(z.string(), Page).optional(),
        menus: z.record(z.string(), z.array(MenuItem)).optional(),
        routes: z.record(z.string(), z.string()).optional().meta({
            description: 'Named paths of the frontend, for `link` actions and redirects.',
        }),
        auth: Auth.optional(),
        dashboard: z.looseObject({ widgets: z.array(Widget) }).optional(),
        search: z.looseObject({ enabled: z.boolean() }).optional(),
        uploads: Uploads.optional(),
        theme: DefinitionTheme.optional(),
        user: User.nullable().optional(),
    })
    .superRefine((definition, context) => {
        const ids = new Set<string>();
        definition.resources.forEach((resource, index) => {
            if (ids.has(resource.id)) {
                context.addIssue({
                    code: 'custom',
                    message: `Duplicate resource id \`${resource.id}\`.`,
                    path: ['resources', index, 'id'],
                });
            }
            ids.add(resource.id);
        });
    })
    .meta({ description: 'Everything a frontend needs to render the admin for the current user.' });

export type User = z.infer<typeof User>;
export type AuthProvider = z.infer<typeof AuthProvider>;
export type AuthToken = z.infer<typeof AuthToken>;
export type Auth = z.infer<typeof Auth>;
export type MenuItem = z.infer<typeof MenuItem>;
export type Page = z.infer<typeof Page>;
export type Widget = z.infer<typeof Widget>;
export type Uploads = z.infer<typeof Uploads>;
export type Definition = z.infer<typeof Definition>;
/** A definition as a backend writes it, before defaults are applied. */
export type DefinitionInput = z.input<typeof Definition>;
