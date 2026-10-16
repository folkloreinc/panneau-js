import type { ComponentType } from 'react';

import type { DataAdapter } from '@panneau/data';
import type {
    Action,
    ActionResult,
    ActionRun,
    ActionScope,
    RouteReference,
    Selection,
} from '@panneau/protocol';

/**
 * What the runner needs from a backend: the action methods of a `DataAdapter`. A product with its
 * own API implements these, and nothing else. Without `cancelActionRun()`, runs can't be cancelled.
 */
export type ActionAdapter = Pick<DataAdapter, 'runAction' | 'getActionRun'> &
    Partial<Pick<DataAdapter, 'cancelActionRun'>>;

/**
 * An action to run, and what it applies to. A list's `ListActionEvent` is one, and so is
 * `{ action, scope: 'item', item }` for the item of a form.
 */
export interface ActionTarget {
    action: Action;
    scope: ActionScope;
    /** The item of an `item` action. */
    item?: { id: string; [key: string]: unknown };
    /** The selection of a `selection` action: ids, or every item matching a query. */
    selection?: Selection;
    /** How many items the action applies to. */
    count?: number;
}

/** What running an action gave. A run that the user cancelled gives `false` instead. */
export type ActionOutcome =
    | { status: 'done'; result: ActionResult }
    | { status: 'queued'; run: ActionRun }
    | { status: 'navigated'; to: string | RouteReference };

/** The download of an action result. */
export type ActionDownload = NonNullable<ActionResult['download']>;

/** Where a result was given: the resource and the action's target. */
export interface ActionResultContext {
    resource: string;
    target: ActionTarget;
}

/** A queued run that the runner follows, until it is dismissed. */
export interface FollowedRun {
    run: ActionRun;
    resource: string;
    target: ActionTarget;
}

/** Props of the handler of a `client` action, which a plugin registers by the action's `component`. */
export interface ClientActionProps {
    action: Action;
    resource: string;
    target: ActionTarget;
    /** Ends the action. With a result, the runner shows it as it shows the result of a server action. */
    onDone: (result?: ActionResult) => void;
    /** Ends the action without running it: a list keeps its selection. */
    onCancel: () => void;
}

/** A handler of `client` actions. */
export type ClientActionHandler = ComponentType<ClientActionProps>;
