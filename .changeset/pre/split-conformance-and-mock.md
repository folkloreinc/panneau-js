---
'@panneau/protocol': patch
---

The conformance kit and the mock backend are split into one module per domain (auth, context, lists, search, aggregates, dashboards, uploads, actions…). Nothing changes for users: the same checks, with the same ids and in the same order, and the same responses.
