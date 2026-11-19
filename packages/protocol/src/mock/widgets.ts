// The data of the widgets of a mock backend (decisions 0064 and 0084).
import type { ContextValues } from '../context';
import { getDashboardWidgets, getSummaryWidgets, readWidgetDataQuery } from '../dashboards';
import type { DefinitionInput } from '../schemas';
import type { Item } from '../schemas/api';
import { checkWidgetData, readsResources } from '../widgets';
import { json, problem } from './http';
import type { MockState } from './state';

/** The widgets with data of their own of a mock backend. */
export function createMockWidgets(
    state: MockState,
    definitionFor: (values: ContextValues) => DefinitionInput,
) {
    const { options, store } = state;
    // A widget with data of its own, of a dashboard page (decisions 0064 and 0084) or of the
    // summary of a resource
    const answerWidget = async (
        id: string,
        params: URLSearchParams,
        values: ContextValues,
        inScope: (resource: string, list: Item[]) => Item[],
    ): Promise<Response> => {
        const read = readWidgetDataQuery(params);
        if (read.errors !== undefined) {
            return problem(422, 'The given data was invalid.', {
                type: 'urn:panneau:problem:validation',
                errors: read.errors,
            });
        }
        const current = definitionFor(values);
        if (read.resource !== undefined) {
            const summarized = current.resources.find(
                (candidate) => candidate.id === read.resource,
            );
            if (summarized?.summary !== undefined && summarized.abilities?.viewAny === false) {
                return problem(403, 'This resource can’t be listed.');
            }
        }
        const widget = (
            read.resource !== undefined
                ? getSummaryWidgets(current, read.resource)
                : getDashboardWidgets(current, read.page)
        ).find((candidate) => candidate.id === id);
        const data = options.widgets?.[id];
        if (widget === undefined || readsResources(widget) || data === undefined) {
            return problem(404, 'Widget not found.');
        }
        const answer =
            typeof data === 'function'
                ? await data({
                      context: values,
                      page: read.page ?? null,
                      resource: read.resource ?? null,
                      query: read.query ?? {},
                      period: read.period,
                      items: (resource) => inScope(resource, store.get(resource) ?? []),
                  })
                : data;
        if (answer instanceof Response) {
            return answer;
        }
        const wrong = checkWidgetData(widget.type, answer);
        return wrong.length === 0
            ? json(200, answer)
            : problem(500, `The data of the widget doesn't have the shape of \`${widget.type}\`.`, {
                  detail: `Wrong keys: ${wrong.map((key) => (key === '' ? '(the data)' : key)).join(', ')}.`,
              });
    };

    return { answerWidget };
}
