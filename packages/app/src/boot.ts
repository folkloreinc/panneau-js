import { BOOT_CONFIG_ELEMENT_ID, type BootConfig, validateBootConfig } from '@panneau/protocol';

/** Validates a boot config, and throws an error that lists what is invalid. */
export function parseBootConfig(input: unknown): BootConfig {
    const result = validateBootConfig(input);
    if (!result.success) {
        const issues = result.issues.map(
            ({ path, message }) => `- ${path === '' ? '(root)' : path}: ${message}`,
        );
        throw new Error(`The Panneau boot config is invalid:\n${issues.join('\n')}`);
    }
    return result.data;
}

/**
 * Reads the boot config that the server wrote in the page, in
 * `<script type="application/json" id="panneau-boot">`, and validates it. Throws when the element
 * is missing, or when its content isn't a valid boot config.
 */
export function readBootConfig(target: Document = document): BootConfig {
    const element = target.getElementById(BOOT_CONFIG_ELEMENT_ID);
    if (element === null) {
        throw new Error(
            `The page has no Panneau boot config: add <script type="application/json" id="${BOOT_CONFIG_ELEMENT_ID}">, or pass \`config\` to createPanneauApp().`,
        );
    }
    let input: unknown;
    try {
        input = JSON.parse(element.textContent);
    } catch (error) {
        throw new Error(
            `The Panneau boot config in #${BOOT_CONFIG_ELEMENT_ID} is not valid JSON.`,
            {
                cause: error,
            },
        );
    }
    return parseBootConfig(input);
}
