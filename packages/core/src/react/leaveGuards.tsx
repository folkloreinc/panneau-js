import { type ReactNode, createContext, use, useEffect, useRef } from 'react';

/** Asks whether the user may leave: resolves `true` to leave, `false` to stay. */
export type LeaveGuard = () => Promise<boolean>;

/**
 * What guards in-app navigation: forms with unsaved changes add a guard while they are dirty,
 * and the router asks them before it leaves the page.
 */
export interface LeaveGuards {
    /** Adds a guard. Returns a function that removes it. */
    add(guard: LeaveGuard): () => void;
    /** Whether a guard would ask: leaving now needs a confirmation. */
    isBlocking(): boolean;
    /** Asks each guard in turn. Resolves `true` when every one lets the user leave. */
    confirmLeave(): Promise<boolean>;
}

/** Creates the guards of an app, for `LeaveGuardsProvider`. */
export function createLeaveGuards(): LeaveGuards {
    const guards = new Set<LeaveGuard>();
    return {
        add(guard) {
            guards.add(guard);
            return () => {
                guards.delete(guard);
            };
        },
        isBlocking: () => guards.size > 0,
        async confirmLeave() {
            for (const guard of [...guards]) {
                if (!(await guard())) {
                    return false;
                }
            }
            return true;
        },
    };
}

const LeaveGuardsContext = createContext<LeaveGuards | null>(null);

export interface LeaveGuardsProviderProps {
    guards: LeaveGuards;
    children?: ReactNode;
}

/**
 * Gives the guards of the app's router to the forms below it, so that leaving a page with unsaved
 * changes asks first. Without it, forms only guard closing and reloading the page.
 */
export function LeaveGuardsProvider({ guards, children }: LeaveGuardsProviderProps) {
    return <LeaveGuardsContext value={guards}>{children}</LeaveGuardsContext>;
}

/** The guards of the closest `LeaveGuardsProvider`, or `null`. */
export function useLeaveGuards(): LeaveGuards | null {
    return use(LeaveGuardsContext);
}

/**
 * Adds `guard` to the guards of the closest `LeaveGuardsProvider` while `active` is true, such
 * as while a form has unsaved changes. The latest `guard` is the one asked.
 */
export function useLeaveGuard(active: boolean, guard: LeaveGuard): void {
    const guards = useLeaveGuards();
    const latest = useRef(guard);
    useEffect(() => {
        latest.current = guard;
    });
    useEffect(() => {
        if (!active || guards === null) {
            return undefined;
        }
        return guards.add(() => latest.current());
    }, [active, guards]);
}
