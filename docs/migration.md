# Migration

Panneau 5 is a clean break: the definition format, the API and the package names change. Projects move to it one at a time, with a guide and tools. The older lines stay maintained until their projects have moved. See [decisions/0016](decisions/0016-migration-strategy.md).

## Maintained lines

| Line                   | Maintained for                                   | Until                                                  |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| `panneau-js` v3.0      | Projects on React 18                             | They migrate (usually during a redesign)               |
| `panneau-js` v4.0      | Projects on v4, `micromag-js` and Micromag sites | They migrate; Micromag is eventually replaced by Niche |
| `laravel-panneau` v1.3 | Most Laravel projects                            | They migrate                                           |
| `laravel-panneau` v1.4 | Projects on Laravel 11+                          | They migrate                                           |

These lines only get fixes and security patches. New features go to 5.x.

## Order

1. **Niche**, during the alphas and betas: the pilot project. It starts directly on 5.x.
2. **The contests platform**, during the betas: the pilot of phase 2 (app shell, auth, permissions, lists, actions). It moves from v1.3 and v4 one item at a time, and its heavily customized admin is the first test case of the migration tools.
3. **Projects on `laravel-panneau` v1.4 and `panneau-js` v4**, after 5.0.0. They are the closest to 5.
4. **Projects on v1.3 and v4.**
5. **Projects on v1.3 with v3 or older (React 18).** These need React 19 as well. They migrate when a redesign or a major update happens, not on their own.
6. **Heavily customized projects** last. Their custom fields and controllers are the best test of the migration tools, so they serve as test cases from the betas onward.

`micromag-js` stays on v4. Micromag will eventually be replaced by Niche.

## Before migrating

These steps can be done on the current lines and make the move smaller:

- Require tagged versions (`^1.3`, `^4.1`) instead of dev branches.
- Move hand-written routes for custom actions into one place, so they map to resource actions.
- Stop importing from `@panneau/core/contexts` and other internals where a public export exists.

## Mapping: Laravel

| v1                                                                                                       | 5                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `config('panneau.resources')` and static props on `Resource` (`$repository`, `$jsonResource`, `$types`…) | Resources registered in a service provider; instance methods (`repository()` or `model()`, `fields()`, `layout()`, `list()`, `actions()`) |
| `Repository` contract and `ResourceItem`                                                                 | `ResourceRepository`, with adapters: Folklore entities and repositories stay as they are; `model()` for Eloquent-only projects            |
| `JsonResource` per resource                                                                              | `toItem()` on the resource, or keep a `JsonResource`                                                                                      |
| `TextLocalized`, `MediaLocalized`…                                                                       | `Text::make('title')->localized()`                                                                                                        |
| `Upload`, `Image`, `ImageUpload`…                                                                        | `Media::make('image')->accept('image/*')`                                                                                                 |
| `Item`, `Items`, `ResourceItem(s)`                                                                       | `Relation`, `Repeater`, `Group`                                                                                                           |
| Custom `ResourceController` subclasses                                                                   | Resource hooks (`query()`, `creating()`, `saved()`) and resource actions                                                                  |
| `routes/panneau.php` with custom routes                                                                  | Resource actions; custom pages through plugins and `pages`                                                                                |
| Generated `HomeController`, `AccountController`, `UploadController`, `PanneauPolicy`, views              | Provided by the package, installed by `panneau:install`                                                                                   |
| `Panneau::resource()` gate on `Panneau::class`                                                           | Policies per item class (Entity contract or model), plus the `viewPanneau` gate                                                           |

Rector rules will cover the mechanical parts: field class renames, `localized()`, and static properties to methods.

## Mapping: JS

| v4                                                                 | 5                                                                                               |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| About 117 `@panneau/*` packages                                    | About a dozen packages with subpath exports                                                     |
| `components` prop with namespaces (`fields`, `pages`, `previews`…) | Plugins (`definePlugin`)                                                                        |
| `@panneau/core/contexts` hooks                                     | Public hooks from `@panneau/core`                                                               |
| `MainLayout`, `ResourceItemsList` from `@panneau/app`              | Public building blocks of `@panneau/app`                                                        |
| `ApiProvider` / `DataProvider` with `Api` classes                  | `DataAdapter` and the REST adapter                                                              |
| CKEditor `html` field                                              | `richtext` field (TipTap); HTML stays the storage format (see [Rich text](#rich-text))          |
| Bootstrap classes in custom components                             | Design tokens and `@panneau/ui` primitives; the Bootstrap-compatible theme eases the transition |

The codemods of `@panneau/codemods` rewrite the entry, the imports and the custom field components, and report the rest: see [Custom fields](#custom-fields).

## Custom fields

In v4, the app found a custom field by name in the `fields` namespace of its `components` prop (`page-slug`, `page_slug` and `PageSlug` all gave `PageSlug`), gave it the field's definition as props, and wrapped it in a `FormGroup` with its label. In 5:

- a **plugin** registers each field type, by the exact `type` of the definition: `definePlugin({ id: 'project', fields: { 'page-slug': PageSlugFieldEntry } })`;
- what it registers is a **registry entry**: a component that gets `FieldEntryProps` of `@panneau/fields` (`field`, `path`, `value`, `onChange`, `onBlur`, `errors`, `disabled`, `readOnly`, `parentValue`, `locale`) and renders a controlled field, with its own label, help and errors;
- the props of a field type beyond those of every field come from the `settings` of the field (`settings()` of the PHP field, which replaces `attributes()`).

### Running the codemods

1. Commit the project, then run `php artisan panneau:install --upgrade`: it writes the entry of 5, `resources/js/panneau.tsx`.
2. Run the codemods on that entry, the container of v4 (the component that renders `<Panneau>` of `@panneau/app`) and the folder of the custom components. Not on the whole site: its own Bootstrap classes would be reported.

    ```bash
    npx @panneau/codemods@alpha v4-to-v5 resources/js/panneau.tsx resources/js/components/Panneau.tsx resources/js/components/panneau --dry
    ```

    `--dry` writes nothing, and prints what would change and every finding. Run it again without `--dry` to write the files.

3. Format the changed files with the project's Prettier (`npx prettier --write`), then `npx eslint --fix`. This step is needed: the codemods keep the code they don't change as it was written, but print what they add their own way (children functions on one line, blank lines around new imports), and `prettier --check` fails until then.
4. Fix each finding. In the files, each one has a `// TODO(panneau-5): …` comment (`grep -rn "TODO(panneau-5)" resources/js`). The codemods change nothing more when run again, and list what is left.
5. Add the packages the components now import to `package.json`, at the version of `@panneau/app` (`^5.0.0-alpha.0` until 5.0.0): `@panneau/core` (the plugin module imports `definePlugin`), `@panneau/fields`, `@panneau/ui`, and `@panneau/forms` or `@panneau/media` when they use them.
6. Delete the code that mounted the container of v4 (`import('./components/Panneau')` behind `isPanneau`): the page of 5 loads `panneau.tsx`.

### The entry

The container becomes the module of the project's plugin, and the entry of 5 gets the plugin. Before, `resources/js/components/Panneau.tsx`:

```tsx
import { useEffect, useState } from 'react';

import Panneau from '@panneau/app';
import '@panneau/app/assets/css/styles.css';
import { FIELDS_NAMESPACE } from '@panneau/core/contexts';

import * as fieldsComponents from './panneau/fields';

export default function PanneauContainer({ definition, user, baseUrl, uploadEndpoint }) {
    const { routes = {} } = definition;
    const [localeLoaded, setLocaleLoaded] = useState(false);
    useEffect(() => {
        import('@panneau/intl/locale/fr').then(() => setLocaleLoaded(true));
    }, []);
    return localeLoaded ? (
        <Panneau
            definition={definition}
            routes={routes}
            user={user}
            baseUrl={baseUrl}
            uppy={{ transport: 'xhr', xhr: { endpoint: uploadEndpoint } }}
            components={{ [FIELDS_NAMESPACE]: fieldsComponents }}
        />
    ) : null;
}
```

After:

```tsx
// resources/js/components/Panneau.tsx
import { definePlugin } from '@panneau/core';

import * as fieldsComponents from './panneau/fields';

export default definePlugin({
    id: 'project',
    fields: {
        'page-slug': fieldsComponents.PageSlug,
        'video-or-embed': fieldsComponents.VideoOrEmbed,
    },
});
```

```tsx
// resources/js/panneau.tsx
import { createPanneauApp } from '@panneau/app';

import projectPlugin from './components/Panneau';

createPanneauApp({
    element: document.getElementById('panneau')!,
    plugins: [projectPlugin],
});
```

- **The keys are the types of the definition, in kebab case.** Check each one against the `type()` of its PHP field: v4 also found `video_or_embed` under `VideoOrEmbed`, Panneau 5 doesn't.
- **The boot config replaces** `definition`, `routes`, `user` and `baseUrl` ([decisions/0019](decisions/0019-app-entry.md)). Messages come with the packages, and their CSS with their modules.
- **Uploads** go to the storage of the media libraries, signed by the API ([decisions/0025](decisions/0025-presigned-uploads.md)): `uppy` and `MediasBrowserProvider` are dropped. Media and image fields need `mediaPlugin` of `@panneau/media` in the plugins.
- **Other namespaces:** `displays`, `pages`, `previews` and `actions` become the parts of the plugin with the same names (`lists` becomes `listLayouts`), whose props are those of 5, which the codemods report. `forms`, `modals`, `filters` and `buttons` have no part.
- **The rest of the container is dropped**, and stays in git: check it for project code.

### A custom field

The component keeps its props. The codemods add its entry next to it, and the index of the fields re-exports the entries (`export { PersonFieldEntry as Person } from './Person'`). Before:

```tsx
import { useFieldComponent } from '@panneau/core/contexts';
import FormGroup from '@panneau/element-form-group';

interface PersonFieldProps {
    value?: PersonValue | null;
    personType?: string | null;
    onChange?: ((value: PersonValue | null) => void) | null;
}

export default function PersonField({
    value = null,
    personType = null,
    onChange = null,
}: PersonFieldProps) {
    const TextField = useFieldComponent('text');
    const Radios = useFieldComponent('radios');
    return (
        <div>
            <FormGroup label="Role">
                <Radios
                    value={value?.role}
                    options={roles}
                    onChange={(role) => onChange?.({ ...value, role })}
                />
            </FormGroup>
            <TextField
                value={value?.name}
                prepend="@"
                onChange={(name) => onChange?.({ ...value, name })}
            />
        </div>
    );
}
```

After:

```tsx
import { type FieldEntryProps, getFieldProps } from '@panneau/fields';
import { SelectField as Radios } from '@panneau/fields/select';
import { TextField } from '@panneau/fields/text';
import { Fieldset } from '@panneau/ui';

// PersonFieldProps and PersonField, as before, with the components of 5:
//     <Radios label="Role" value={value?.role} options={roles} onChange={…} widget="radios" />
//     <TextField value={value?.name} prefix="@" onChange={…} />

// TODO(panneau-5): `PersonFieldEntry` reads `personType` from the `settings` of the field: give it with `settings()` of the PHP field
/** The registry entry of `PersonField` for Panneau 5: its props from the field (written by @panneau/codemods). */
export function PersonFieldEntry(props: FieldEntryProps) {
    const { label, description, errors, required, className } = getFieldProps(props);
    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            className={className}
        >
            <PersonField
                value={props.value as PersonFieldProps['value']}
                personType={props.field.settings?.personType as PersonFieldProps['personType']}
                onChange={props.onChange}
            />
        </Fieldset>
    );
}
```

The entry gives each prop the component destructures:

| v4 prop                                   | In the entry                                                   |
| ----------------------------------------- | -------------------------------------------------------------- |
| `value`, `onChange`, `onBlur`             | `props.value`, `props.onChange`, `props.onBlur`                |
| `label`, `helpText`, `errors`, `required` | From `getFieldProps(props)` (`description` for the help)       |
| `disabled`, `readOnly`, `className`       | From `getFieldProps(props)` (`readOnly` of the field too)      |
| `name`, `placeholder`                     | From `getFieldProps(props)`: the path, the field's placeholder |
| `fieldLocale`, `locale`                   | `props.locale`: the locale of the value, in a localized field  |
| `locales`                                 | `useFieldsContext().locales` of `@panneau/fields`              |
| Any other prop                            | `props.field.settings?.<prop>`, reported                       |

- **Labels.** v5 fields render their own label, help and errors. The entry wraps the component in a `Fieldset` of `@panneau/ui` with those of the field, as v4 wrapped it in a form group. A component that forwards `...props` to a field instead gets its `value` and `onChange`, `getFieldProps(props)` and the field's settings, and no fieldset: the field it renders shows the label.
- **Localized values.** A field whose PHP field is `->localized()` is rendered once per locale, with `locale` and the value of that locale. A component that takes `locales` and renders every locale itself (a `LocalizedField`) is reported: its PHP field must not be localized.
- **The form's values.** `useFormValue()` becomes `useFormState(useFormContext()).values` of `@panneau/forms`. The entry also gets `parentValue`, the object the field belongs to.
- **Types.** In TypeScript, the entry casts each value to the type of the component's prop: the definition gives `unknown`.

### Fields that render other fields

`useFieldComponent('<id>')` and the default exports of `@panneau/field-*` become the controlled components of 5, under the same local names:

| v4                                                       | 5                                                                                                                                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`, `textarea`, `email`, `url`, `telephone`          | `TextField`, `TextAreaField`, `EmailField`, `UrlField`, `TelField` of `@panneau/fields/<type>`                                                                                                    |
| `number`, `color`, `date`, `date-time`                   | `NumberField`, `ColorField`, `DateField`, `DateTimeField`                                                                                                                                         |
| `select`, `radios`, `checkboxes`, `toggles`              | `SelectField`, with `widget="radios"` or `multiple widget="checkboxes"`                                                                                                                           |
| `toggle`, `checkbox`                                     | `BooleanField`, with `widget="switch"` for a toggle                                                                                                                                               |
| `embed`                                                  | `EmbedField`                                                                                                                                                                                      |
| `localized`                                              | `LocalizedField`: `fieldComponent={TextField}` becomes its children function, which gives the input of each locale (and `fieldLocale` to a project component). Without `fieldComponent`, reported |
| `fields`, `items`                                        | `GroupField`, `RepeaterField`: their `fields` are fields of the protocol, reported                                                                                                                |
| `item`, `resource-item`                                  | `RelationField`, with the id of the resource, reported                                                                                                                                            |
| `upload`, `media`, `image`, `video`, `audio`, `document` | `MediaField` or `ImageField` of `@panneau/media` (`accept` for video and audio), with the id of the library, reported                                                                             |
| `html`                                                   | `richtext` of `@panneau/editor`, reported                                                                                                                                                         |
| An id of the project (`video_or_embed`)                  | Reported: import its component                                                                                                                                                                    |

- **Props** with another name in 5 are renamed (`prepend` and `append` become `prefix` and `suffix`, `helpText` becomes `description`). Props a component of 5 doesn't have (`withoutReset`, `noOptionsMessage`, `uncheckable`, `withButton`) are reported, and stay, so that TypeScript points at them. A `label` that is a message descriptor of `defineMessages()` is reported: labels of 5 are nodes.
- **`FormGroup`** around one of these fields becomes the field's `label` (and `description`, and its `className` when the field has none). Around anything else, it becomes a `Fieldset` of `@panneau/ui` (`legend`).

### What the codemods report

Every finding has the file, the line and what replaces the code, when 5 has something:

- **Imports of v4 with no rewrite:** `usePanneauResource` (`useResource(id)` of `@panneau/core`), `useResourceItems` (`useResourceList()` of `@panneau/data/query`), `useUrlGenerator` (no named routes in 5), the other hooks of `@panneau/core/contexts`, `@panneau/element-*` (the primitives of `@panneau/ui`), `MainLayout` and `PageHeader` (pages render inside the shell). They stay, so that the build fails until they are replaced.
- **What needs a check:** the keys of the plugin, the props read from `settings`, the stylesheets of the project kept in the plugin module.
- **Bootstrap classes** in `className` and `*ClassName` props, each with a comment (class names kept in variables are not found): Panneau 5 has no Bootstrap. Replace them with `@panneau/ui` primitives (`Stack`, `Inline`, `Button`) and CSS Modules with design tokens, or keep them with the Bootstrap-compatible theme.

## Rich text

The CKEditor `html` field of v4 becomes the `richtext` field of `@panneau/editor` ([README](../packages/editor/README.md)). Its HTML needs no conversion:

- Content loads as it was written, and saves unchanged until it is edited. Once edited, it renders the same: classes, attributes, `<i>` or `<em>`, bare list items, and the HTML the field doesn't edit (media embeds, iframes, tables, social posts) are kept.
- The `ckConfig` of a v4 field maps to `settings` (`RichTextSettings`), set by the `RichText` builder of `laravel-panneau`:

| `ckConfig` of v4                                                | `settings` of 5                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------- |
| `toolbar`: `heading`, `bold`, `italic`, `link`, `bulletedList`… | `toolbar`: `heading`, `bold`, `italic`, `link`, `bulletList`…       |
| `heading.options` (`heading2`, `heading4`…)                     | `headings`: `[2, 4]`                                                |
| `style.definitions`: `{ name, element: 'p', classes: ['big'] }` | `styles`: `{ label, element: 'p', class: 'big' }`                   |
| `link.addTargetToExternalLinks`                                 | `links.newTab`: `external`                                          |
| A plugin of the project (an inline logo)                        | TipTap extensions and buttons in `createEditorPlugin()`             |
| `mediaEmbed`                                                    | Existing embeds are kept; adding new ones is not in the toolbar yet |

- A CKEditor heading option written as a block `<span>` (`{ model: 'logo', view: 'span' }`) needs a block-level node in the project's plugin: without one, its text becomes a paragraph once edited.
- Before migrating, `normalizeRichText()` shows what the field would write for existing content, with the extensions of the project's plugin.
- The styles of block styles (`p.big`) come from the project's CSS, as with CKEditor.

## Per project

Each migration is a pull request in the project, following this checklist:

1. Upgrade `laravel-panneau` and `@panneau/*` to 5.x together.
2. Run `php artisan panneau:install --upgrade`, Rector, then the JS codemods ([Custom fields](#custom-fields)).
3. Move resources, fields and custom routes, following the mapping above.
4. Delete the files that the package now provides.
5. Check every resource page in the browser: list, create, edit, delete, plus custom actions.
6. Update the project in the inventory of `folkloreinc/folklore-dev`.
