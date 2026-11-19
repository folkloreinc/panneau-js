import { type BootConfig, validateBootConfig } from '@panneau/protocol';

import { readBootConfigInput } from './bootInput';

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
    return parseBootConfig(readBootConfigInput(target));
}
