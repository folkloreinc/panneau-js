# @panneau/forms

Forms of Panneau: fields of [`@panneau/fields`](../fields) in a layout, driven by the form state of [`@panneau/core`](../core). They show errors, guard unsaved changes and resolve version conflicts. They don't save anything themselves: the caller passes `onSubmit`.

```bash
npm install @panneau/forms@^5.0.0-alpha.0 @panneau/ui@^5.0.0-alpha.0 react-aria-components react-intl
```

## Without a definition

A product with its own API passes fields and an `onSubmit`:

```tsx
import { Form } from '@panneau/forms';
import { PanneauRoot } from '@panneau/ui';

<PanneauRoot>
    <Form
        fields={[
            { name: 'name', type: 'text', label: 'Name', rules: [{ rule: 'required' }] },
            { name: 'email', type: 'email', label: 'Email', rules: [{ rule: 'email' }] },
        ]}
        values={member}
        onSubmit={(values) => api.updateMember(member.id, values)}
    />
</PanneauRoot>;
```

- **Validation:** the portable rules of each field are checked on blur and on submit, with messages translated by react-intl.
- **Server errors:** when `onSubmit` throws an error that carries problem details (`error.problem`, as the errors of `@panneau/data` do), a `422` shows its errors by path, next to their fields. A `412` opens the conflict dialog.
- When `onSubmit` returns an item (`id`, `version`, `abilities`), the form continues from it.

## From a definition

```tsx
const { fields, layout } = resolveForm(resource, { mode: 'update' });

<Form
    fields={fields}
    layout={layout}
    values={getItemValues(item)}
    version={item.version}
    mode="update"
    onSubmit={(values, { version, changes }) =>
        adapter.update('pages', item.id, changes, { version })
    }
/>;
```

Under a `PanneauProvider`, forms use the field components of the plugins and the locales of the definition.

## What a form does

| Feature           | How                                                                                                                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout            | `row` (12-column widths), `column`, `section` (collapsible), `tabs`, `sidebar`, `text`, `component`, and `visibleWhen`                                                                                                     |
| Phones            | Rows stack and the sidebar goes under the form when the form is narrow (container queries)                                                                                                                                 |
| Errors            | Next to each field, nested fields included (`blocks.2.body`), in a summary with links, and counted on tabs and sections                                                                                                    |
| First error       | After a failed submit, its tab or section opens, and the field scrolls into view and gets focus                                                                                                                            |
| Server errors     | An alert with a retry in the form, and a toast                                                                                                                                                                             |
| Unsaved changes   | The page asks before closing (`guardUnsavedChanges`). Under a `LeaveGuardsProvider` of `@panneau/core`, leaving through the app's router asks in a dialog too; `useLeaveConfirmation()` gives that dialog to other routers |
| Broken fields     | Each field has an error boundary: a field that throws shows a message, the rest of the form keeps working                                                                                                                  |
| Version conflicts | A dialog shows the values that differ, then loads the current version or saves the local one over it                                                                                                                       |

`Form` creates its state with `useForm()`. To keep the state outside, use `useForm()` and `FormView`.

## Messages

Strings go through react-intl, with English defaults. Add the messages of every Panneau package to the app's with `withPanneauMessages()` from [`@panneau/intl`](../intl), or use `fieldsPlugin`, which carries them. `@panneau/forms/locales` is deprecated.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md). Why forms depend on `@panneau/core`: [decision 0021](../../docs/decisions/0021-forms-render-core-state.md).
