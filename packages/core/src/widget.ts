import type { Definition, Widget } from '@panneau/protocol';
import type { OverviewPeriodOption } from '@panneau/protocol/runtime';

/**
 * Props of a widget (the `widgets` of a plugin, and the built-in ones), for a widget of the
 * dashboard whose `type` it provides (decisions 0064 and 0097). The dashboard gets the data from
 * `GET /dashboard/widgets/{widget}` and draws the frame, the label, the skeleton, the error with
 * its retry, and nothing on a `403`: the component draws the data.
 */
export interface WidgetProps {
    /** The widget, as declared in the definition: its `settings` are the plugin's own. */
    widget: Widget;
    /** The data of the widget, in the shape the plugin's backend gives it. */
    data: unknown;
    definition: Definition;
    /**
     * The currency of the values, for a widget that sums `money`. Built-in types only, whose data
     * the dashboard computes (decision 0084).
     */
    currency?: string | undefined;
    /** The option of the period of the overview, when the widget follows it (decision 0084). */
    period?: OverviewPeriodOption | null | undefined;
}
