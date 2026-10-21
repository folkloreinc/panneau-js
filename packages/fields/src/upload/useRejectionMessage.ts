import { usePanneauIntl } from '@panneau/ui';

import { messages } from '../shared/messages';
import { formatSize } from './files';
import type { UploadRejection } from './types';

/** The message of a file refused before it was sent, for a field's errors. */
export function useRejectionMessage(
    maxSize: number | null | undefined,
): (file: File, reason: UploadRejection) => string {
    const intl = usePanneauIntl();
    return (file, reason) =>
        reason === 'accept'
            ? intl.formatMessage(messages.rejectedType, { name: file.name })
            : intl.formatMessage(messages.rejectedSize, {
                  name: file.name,
                  size: formatSize(maxSize ?? 0, intl.locale),
              });
}
