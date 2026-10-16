# @panneau/protocol

The contract between Panneau frontends and backends: the definition format and the HTTP API, written as schemas, with the tools to check an implementation.

The protocol is explained in [`docs/protocol.md`](../../docs/protocol.md).

```ts
import {
    type Definition,
    checkValues,
    toSearchParams,
    validateDefinition,
} from '@panneau/protocol';
import { runConformance } from '@panneau/protocol/conformance';
import { createMockBackend } from '@panneau/protocol/mock';
import { checkValues, evaluateCondition } from '@panneau/protocol/runtime';
```

**In the browser,** import the helpers from `@panneau/protocol/runtime`, and only types from `@panneau/protocol`. The main entry point loads zod and builds every schema, which bundlers can't drop (about 360 KB of source). `@panneau/core`, `fields`, `forms` and `lists` follow this rule, and ESLint enforces it in them.

| Export                                     | Content                                                                                                                                                                                                                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@panneau/protocol`                        | Schemas (Zod) and types, `validateDefinition()`, `validateBootConfig()`, `lintDefinition()`, `checkValues()` (portable rules), `evaluateCondition()`, list query helpers, OpenAPI and JSON Schema generators                                                                |
| `@panneau/protocol/runtime`                | The constants and the helpers that run in the browser, without zod: `checkValues()`, `checkRules()`, `evaluateCondition()`, `lintDefinition()`, `getValue()`, `isFilled()`, `isProblem()`, `toSearchParams()`, `fromSearchParams()`. The main entry point also exports them |
| `@panneau/protocol/mock`                   | `createMockBackend()`: an in-memory backend for tests and development                                                                                                                                                                                                       |
| `@panneau/protocol/conformance`            | `runConformance()`: checks a live backend against the protocol                                                                                                                                                                                                              |
| `@panneau/protocol/definition.schema.json` | JSON Schema of the definition                                                                                                                                                                                                                                               |
| `@panneau/protocol/openapi.json`           | OpenAPI 3.1 document of the API                                                                                                                                                                                                                                             |
| `@panneau/protocol/boot.schema.json`       | JSON Schema of the boot config, which a server writes in the page of the app                                                                                                                                                                                                |

## Changing the protocol

1. Change the schemas in `src/schemas` (and the rules, mock or conformance checks they affect), with tests.
2. Run `npm run build` in this package. It regenerates `schema/`, and a test fails if the files are out of date.
3. Update `docs/protocol.md`.
4. Within protocol version 1, changes are additive only: new optional properties, new endpoints, new rules (which older clients ignore).
