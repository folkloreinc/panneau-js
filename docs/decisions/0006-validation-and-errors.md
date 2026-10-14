# 0006: Portable validation rules and problem+json errors

- Status: accepted
- Date: 2026-10-14

## Context

v4 only validates on the server. The user submits, waits, and gets Laravel's 422 response. Several PHP fields don't even declare basic rules (`Email` has no `email` rule, `Select` no `in` rule). Other errors (network, 403, 500) only show a general message. A crash in one field breaks the whole page.

## Decision

- **Portable rules.** Fields declare their rules in the definition, from a portable set:
    - `required`, `min`, `max`, `pattern`;
    - `email`, `url`, `in`;
    - `accept`, `maxSize`;
    - `before`, `after`.
- **Checked twice.** The engine checks these rules in the browser, on blur and on submit. `laravel-panneau` turns the same rules into Laravel rules, so they are declared once.
- **The server is authoritative.** It checks the portable rules again, plus server-only rules (uniqueness, existence, business rules).
- **Errors use RFC 9457 `application/problem+json`.** Validation errors are a map of dot paths (`title.fr`, `blocks.2.image`) to messages.
- **Showing errors:**
    - next to each field;
    - an error summary at the top of the form;
    - a scroll to the first error;
    - error counts on tabs and collapsed sections.
- **Error boundaries** wrap pages, list rows and fields. Network and server errors show a toast with a retry when it makes sense.
- **Unsaved changes** are guarded on navigation.

## Consequences

- Most mistakes are caught before the request.
- Field-level errors work the same for every backend.
- Laravel's default 422 format is converted by `laravel-panneau` for Panneau routes only. The site's other routes keep their format.
