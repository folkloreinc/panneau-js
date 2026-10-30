// TODO(panneau-5): `usePanneauResource` of `@panneau/core/contexts`: `useResource(id)` of `@panneau/core` gives `{ resource, form, list }`: the fields of the resource are `resource.fields`, fields of the protocol
import { usePanneauResource } from '@panneau/core/contexts';
// TODO(panneau-5): `useResourceItems` of `@panneau/data`: `useResourceList(resource, query)` of `@panneau/data/query`: its `data.data` are the items, and the query is a list query of the protocol (`page`, `perPage`, `filter`)
import { useResourceItems } from '@panneau/data';

import { SelectField } from '@panneau/fields/select';

interface ItemsResourceProps {
    resource: string;
    value?: { id: string } | null;
    onChange?: ((value: { id: string } | null) => void) | null;
}

export default function ItemsResource({ resource, value = null, onChange = null }: ItemsResourceProps) {
    const { items } = useResourceItems(usePanneauResource(resource)!, { paginated: false });
    const options = (items || []).map(({ id, title }: any) => ({ label: title, value: { id } }));
    // TODO(panneau-5): `<SelectField>`: `withoutReset` is not a prop of `SelectField` of `@panneau/fields/select`
    return <SelectField value={value} options={options} onChange={onChange} withoutReset />;
}
