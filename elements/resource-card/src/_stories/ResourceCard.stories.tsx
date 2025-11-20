import ResourceCardElement from '../ResourceCard';

export default {
    component: ResourceCardElement,
    title: 'Elements/ResourceCard',
    parameters: {
        intl: true,
    },
};

const item = { id: 1, name: 'Paul' };

export const Normal = {
    render: () => <ResourceCardElement item={item} itemLabelPath="name" />,
};

export const WithIdAndChildren = {
    render: () => (
        <ResourceCardElement
            item={item}
            itemLabelPath="name"
            itemLabelWithId
            header={<div>Good times</div>}
            footer={<span>More info</span>}
        >
            <div className="ms-1">More more info</div>
        </ResourceCardElement>
    ),
};

export const WithActions = {
    render: () => (
        <ResourceCardElement
            item={item}
            itemLabelPath="name"
            itemLabelWithId
            onClickEdit={() => {}}
            onClickRemove={() => {}}
        />
    ),
};
