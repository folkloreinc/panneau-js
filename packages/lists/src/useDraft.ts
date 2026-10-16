import { useEffect, useEffectEvent, useState } from 'react';

/**
 * A text that is typed locally and committed after a pause: the list query changes once the user
 * stops typing, not on every key. A change of `value` from outside (a chip removed, the query
 * reset) replaces the draft.
 */
export function useDraft(
    value: string,
    commit: (value: string) => void,
    delay = 300,
): { draft: string; setDraft: (draft: string) => void; flush: () => void } {
    const [draft, setDraft] = useState(value);
    const [synced, setSynced] = useState(value);
    if (value !== synced) {
        setSynced(value);
        setDraft(value);
    }
    const onCommit = useEffectEvent((next: string) => commit(next));
    useEffect(() => {
        if (draft === synced) {
            return undefined;
        }
        const timer = setTimeout(() => onCommit(draft), delay);
        return () => clearTimeout(timer);
    }, [draft, synced, delay]);
    return {
        draft,
        setDraft,
        flush: () => {
            if (draft !== synced) {
                commit(draft);
            }
        },
    };
}
