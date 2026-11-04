import type { Definition, Widget } from '@panneau/protocol';

/**
 * Props of a widget of a plugin (the `widgets` of a plugin), for a widget of the dashboard whose
 * `type` it provides (decision 0064). The dashboard gets the data from
 * `GET /dashboard/widgets/{widget}` and draws the frame, the label, the skeleton, the error with
 * its retry, and nothing on a `403`: the component draws the data.
 */
export interface WidgetProps {
    /** The widget, as declared in the definition: its `settings` are the plugin's own. */
    widget: Widget;
    /** The data of the widget, in the shape the plugin's backend gives it. */
    data: unknown;
    definition: Definition;
}
