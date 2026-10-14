import type { Resource } from '@panneau/core';
import { useUrlGenerator } from '@panneau/core/contexts';
import { useResourceItem } from '@panneau/data';
import Link from '@panneau/element-link';

import MainLayout from '../../components/layouts/Main';
import PageHeader from '../../components/partials/PageHeader';

interface EventShowPageProps {
    resource: Resource;
    itemId: string;
}

/**
 * Example of a resource page override, set on the resource with:
 * pages: { resourceShowPage: { component: 'event-show-page' } }
 */
function EventShowPage({ resource, itemId }: EventShowPageProps) {
    const route = useUrlGenerator();
    const { item = null, isLoading } = useResourceItem(resource, itemId);
    const { title = null, venue = null, starts_at: startsAt = null, speakers = [] } = item || {};
    return (
        <MainLayout loading={isLoading}>
            <PageHeader
                title={title?.fr || '…'}
                actions={
                    <Link
                        className="btn btn-primary"
                        href={route('resources.edit', { resource: resource.id, id: itemId })}
                    >
                        Modifier
                    </Link>
                }
            />
            {item !== null ? (
                <div className="container-sm py-4">
                    <dl className="row">
                        <dt className="col-sm-3">Lieu</dt>
                        <dd className="col-sm-9">{venue}</dd>
                        <dt className="col-sm-3">Début</dt>
                        <dd className="col-sm-9">{startsAt}</dd>
                        <dt className="col-sm-3">Intervenants</dt>
                        <dd className="col-sm-9">
                            {(speakers || []).map(({ id, name }) => name || id).join(', ')}
                        </dd>
                    </dl>
                </div>
            ) : null}
        </MainLayout>
    );
}

export default EventShowPage;
