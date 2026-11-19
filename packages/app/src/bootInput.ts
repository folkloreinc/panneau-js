import { BOOT_CONFIG_ELEMENT_ID } from '@panneau/protocol';

/**
 * The boot config that the server wrote in the page, in
 * `<script type="application/json" id="panneau-boot">`, as JSON, before it is validated. Throws when
 * the element is missing, or when its content isn't JSON. Without Zod, so that `createPanneauApp()`
 * reads it before the schemas load (decision 0095).
 */
export function readBootConfigInput(target: Document = document): unknown {
    const element = target.getElementById(BOOT_CONFIG_ELEMENT_ID);
    if (element === null) {
        throw new Error(
            `The page has no Panneau boot config: add <script type="application/json" id="${BOOT_CONFIG_ELEMENT_ID}">, or pass \`config\` to createPanneauApp().`,
        );
    }
    try {
        return JSON.parse(element.textContent) as unknown;
    } catch (error) {
        throw new Error(
            `The Panneau boot config in #${BOOT_CONFIG_ELEMENT_ID} is not valid JSON.`,
            {
                cause: error,
            },
        );
    }
}
