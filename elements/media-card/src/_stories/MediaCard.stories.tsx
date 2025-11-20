import MediaCard from '../MediaCard';

export default {
    component: MediaCard,
    title: 'Elements/MediaCard',
    parameters: {
        intl: true,
    },
};

const value = {
    data: { file: '1200x300.png' },
    preview: 'https://picsum.photos/400/300',
    url: '/panneau/link',
};

export const Normal = {
    render: () => <MediaCard value={value} />,
};

export const Link = {
    render: () => <MediaCard value={value} linkPath="url" />,
};

export const Empty = {
    render: () => <MediaCard value={null} />,
};

export const WithRemove = {
    render: () => <MediaCard value={value} onClickRemove={() => console.log('hello')} />,
};

export const WithoutDescription = {
    render: () => <MediaCard value={value} withoutDescription linkPath="url" />,
};

export const WithoutDescriptionAndRemove = {
    render: () => (
        <MediaCard
            value={value}
            withoutDescription
            linkPath="url"
            onClickRemove={() => console.log('hello')}
        />
    ),
};

export const Vertical = {
    render: () => <MediaCard vertical value={value} />,
};

export const VerticalMax = {
    render: () => <MediaCard vertical value={value} maxWidth={160} />,
};

export const VerticalWithoutDescriptionAndRemove = {
    render: () => (
        <MediaCard
            value={value}
            vertical
            withoutDescription
            linkPath="url"
            onClickRemove={() => console.log('hello')}
        />
    ),
};

export const VerticalButton = {
    render: () => <MediaCard value={value} vertical onClick={() => console.log('hello')} />,
};

export const VerticalButtonActive = {
    render: () => (
        <MediaCard value={value} vertical onClick={() => console.log('hello')} selected />
    ),
};

export const Dark = {
    render: () => (
        <div data-bs-theme="dark" style={{ padding: 20, backgroundColor: '#000' }}>
            <MediaCard value={value} />
        </div>
    ),
};
