import { definePlugin } from '@panneau/core';

import * as actionsComponents from './panneau/actions';
import * as displaysComponents from './panneau/displays';
import * as fieldsComponents from './panneau/fields';

import '../../styles/panneau.scss';

// The plugin of the project for Panneau 5, made by @panneau/codemods from the container of
// v4. The entry passes it to `createPanneauApp({ element, plugins })`.
// TODO(panneau-5): the keys of `fields` are the types of the definition, in kebab case: check each one against the `type()` of its PHP field (v4 also found `video_or_embed` under `VideoOrEmbed`)
// TODO(panneau-5): `displays`: displays of Panneau 5 get `value`, `item`, `field` and `column` (`DisplayProps` of `@panneau/lists`)
// TODO(panneau-5): the keys of `displays` are in kebab case: check each one against the name the definition uses
// TODO(panneau-5): `actions`: actions of Panneau 5 are handlers of `client` actions of the definition, not buttons: see decision 0017
// TODO(panneau-5): the keys of `actions` are in kebab case: check each one against the name the definition uses
// TODO(panneau-5): the `buttons` components have no place in the plugins of Panneau 5: see the migration guide
// TODO(panneau-5): `uppy` is dropped: uploads go to the storage of the media libraries, signed by the API (decision 0025); Media and Image fields need `mediaPlugin` of `@panneau/media` in the plugins
// TODO(panneau-5): `../../styles/panneau.scss` was written for v4 and Bootstrap: check what it still styles
export default definePlugin({
    id: 'project',
    fields: {
        link: fieldsComponents.Link,
        'page-slug': fieldsComponents.PageSlug,
        'page-slug-localized': fieldsComponents.PageSlugLocalized,
        person: fieldsComponents.Person,
        schedule: fieldsComponents.Schedule,
        visual: fieldsComponents.Visual,
    },
    displays: {
        'text-localized': displaysComponents.TextLocalized,
    },
    actions: {
        publish: actionsComponents.Publish,
    },
});
