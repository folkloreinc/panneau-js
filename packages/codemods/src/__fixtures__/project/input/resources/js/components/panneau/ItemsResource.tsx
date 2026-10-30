import { useFieldComponent, usePanneauResource } from '@panneau/core/contexts';
import { useResourceItems } from '@panneau/data';

interface ItemsResourceProps {
    resource: string;
    value?: { id: string } | null;
    onChange?: ((value: { id: string } | null) => void) | null;
}

export default function ItemsResource({ resource, value = null, onChange = null }: ItemsResourceProps) {
    const SelectField = useFieldComponent('select');
    const { items } = useResourceItems(usePanneauResource(resource)!, { paginated: false });
    const options = (items || []).map(({ id, title }: any) => ({ label: title, value: { id } }));
    return <SelectField value={value} options={options} onChange={onChange} withoutReset />;
}
