import { z } from 'zod';

import { PROTOCOL_VERSION } from '../version';
import { Definition } from './definition';

/**
 * Id of the element that holds the boot config in the page: a
 * `<script type="application/json" id="panneau-boot">` element whose text is the JSON object.
 */
export const BOOT_CONFIG_ELEMENT_ID = 'panneau-boot';

export const BootConfig = z
    .looseObject({
        protocol: z.literal(PROTOCOL_VERSION),
        apiBaseUrl: z.string().min(1).meta({
            description:
                'URL of the API (`/panneau/api`), where the app fetches `{apiBaseUrl}/definition`. A path or an absolute URL.',
        }),
        basePath: z
            .string()
            .regex(/^\/([^/?#]+(\/[^/?#]+)*)?\/?$/, 'A path that starts with `/`.')
            .meta({
                description:
                    'Path of the app in the site (`/panneau`, or `/` on its own domain). Client routes are under it.',
            }),
        locale: z
            .string()
            .min(2)
            .meta({ description: 'BCP 47 locale of the UI, used before the definition loads.' }),
        // The type is written out so that declaration files reference the definition's schema.
        definition: Definition.optional().meta({
            description:
                'The definition for the current user, inlined so the app skips the first `GET /definition`.',
        }) as z.ZodOptional<typeof Definition>,
        loginUrl: z.string().nullable().optional().meta({
            description:
                'Where to send unauthenticated users when the API answers `401` before the definition is loaded. Afterwards, `auth.loginUrl` of the definition is used.',
        }),
    })
    .meta({
        description:
            'What a server writes in the page so the app can start, in the element `#panneau-boot`.',
    });

export type BootConfig = z.infer<typeof BootConfig>;
/** A boot config as a backend writes it, before defaults are applied. */
export type BootConfigInput = z.input<typeof BootConfig>;
