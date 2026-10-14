import LinkElement from '../Link';

export default {
    component: LinkElement,
    title: 'Elements/Link',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => (
        <LinkElement href="/blabla">
            {{ id: 'test', defaultMessage: 'Translated Link' }}
        </LinkElement>
    ),
};

export const External = {
    render: () => (
        <LinkElement href="/blabla" external>
            {{ id: 'test', defaultMessage: 'Translated Link' }}
        </LinkElement>
    ),
};

export const WithoutStyle = {
    render: () => (
        <LinkElement href="/blabla" withoutStyle>
            {{ id: 'test', defaultMessage: 'Translated Link' }}
        </LinkElement>
    ),
};
