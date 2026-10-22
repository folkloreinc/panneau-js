# Mockups

Mockups of components before they are built, so their UX can be agreed on in review. They are Storybook stories (under "Mockups") with static data and no network. They are not in any package: nothing here is built, published or part of an API report. Once a component is built in its package, delete its mockup.

| Mockup                                        | Screenshots                                                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [Image editor and image field](image-editor/) | [`docs/mockups/image-editor/`](../docs/mockups/image-editor/), [`docs/mockups/image-field/`](../docs/mockups/image-field/) |

- **Rules.** Mockups follow the rules of the packages where they can: `@panneau/ui` components, `--panneau-*` tokens, Lucide icons, and stories that pass the axe checks. Their text is English and inline, not in `@panneau/intl`.
- **Checks.** The root `tsconfig.json` typechecks them, ESLint and Prettier check them, and `npm run test:storybook` runs their stories.
- **Screenshots.** Build Storybook, then take a screenshot of every story under "Mockups/" (desktop, or a phone for the stories named "Phone…"):

    ```bash
    npm run build-storybook
    node mockups/screenshots.js
    ```
