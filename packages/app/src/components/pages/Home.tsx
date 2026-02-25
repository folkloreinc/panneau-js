import { FormattedMessage } from 'react-intl';

import type { Resource } from '@panneau/core';
import { usePanneauResources, useUrlGenerator } from '@panneau/core/contexts';
import Link from '@panneau/element-link';
import { useResourceValues } from '@panneau/intl';

import MainLayout from '../layouts/Main';

interface ResourceLinkProps {
    resource: Resource;
}

function ResourceLink({ resource }: ResourceLinkProps) {
    const route = useUrlGenerator();
    const { id: resourceId } = resource || {};
    const resourceValues = useResourceValues(resource);

    return (
        <Link
            className="d-block my-2"
            href={route('resources.index', {
                resource: resourceId,
            })}
        >
            <FormattedMessage
                values={resourceValues}
                defaultMessage="View {the_plural}"
                description="Button label"
            />
        </Link>
    );
}

function HomePage() {
    const resources = usePanneauResources();
    const visibleResources = resources.filter(
        ({ settings: { hideInNavbar = false } = {} }) => !hideInNavbar,
    );
    return (
        <MainLayout>
            <div className="container-sm py-4">
                {visibleResources.map((resource) => {
                    const { id: resourceId } = resource || {};
                    return <ResourceLink key={`resource-link-${resourceId}`} resource={resource} />;
                })}
            </div>
        </MainLayout>
    );
}

export default HomePage;
