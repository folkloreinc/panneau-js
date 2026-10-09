import type { Resource } from '@panneau/core';
import { usePanneau, usePanneauResources, useUrlGenerator } from '@panneau/core/contexts';
import { useResourceItems } from '@panneau/data';
import Link from '@panneau/element-link';

import MainLayout from '../../components/layouts/Main';
import PageHeader from '../../components/partials/PageHeader';

interface ResourceCardProps {
    resource: Resource;
}

function ResourceCard({ resource }: ResourceCardProps) {
    const route = useUrlGenerator();
    const { id, name } = resource;
    const { pagination = null, loading } = useResourceItems(resource, null, 1, 1);
    const { total = null } = pagination || {};
    return (
        <div className="card h-100">
            <div className="card-body">
                <h2 className="h5 card-title">{name}</h2>
                <p className="display-6 mb-0">{loading || total === null ? '…' : total}</p>
            </div>
            <div className="card-footer d-flex">
                <Link href={route('resources.index', { resource: id })}>Voir tout</Link>
                <Link className="ms-auto" href={route('resources.create', { resource: id })}>
                    Ajouter
                </Link>
            </div>
        </div>
    );
}

/**
 * Example of a custom home page, set with `pages.home.component` in the definition
 */
function DashboardPage({ title = 'Tableau de bord' }: { title?: string }) {
    const { name } = usePanneau();
    const resources = usePanneauResources();
    return (
        <MainLayout>
            <PageHeader title={title} />
            <div className="container-sm py-4">
                <p className="lead">Bienvenue dans l’administration de {name}.</p>
                <div className="row g-3">
                    {resources.map((resource) => (
                        <div className="col-12 col-md-6 col-lg-4" key={`resource-${resource.id}`}>
                            <ResourceCard resource={resource} />
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}

export default DashboardPage;
