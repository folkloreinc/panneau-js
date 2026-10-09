import { useResourceItems } from '@panneau/data';

import MainLayout from '../../components/layouts/Main';
import PageHeader from '../../components/partials/PageHeader';

const CATEGORIES: Record<string, string> = {
    concert: 'Concerts',
    conference: 'Conférences',
    workshop: 'Ateliers',
    exhibition: 'Expositions',
};

/**
 * Example of a custom route, set in the definition with:
 * routes: { statistics: { path: '/statistiques', component: 'statistics-page' } }
 */
function StatisticsPage() {
    const { items = null, loading } = useResourceItems('events');
    const counts: Record<string, number> = (items || []).reduce(
        (all, { category = null }) =>
            category !== null ? { ...all, [category]: (all[category] || 0) + 1 } : all,
        {},
    );
    return (
        <MainLayout loading={loading}>
            <PageHeader title="Statistiques" />
            <div className="container-sm py-4">
                <h2 className="h5">Événements par catégorie</h2>
                <ul className="list-group">
                    {Object.keys(CATEGORIES).map((category) => (
                        <li
                            key={`category-${category}`}
                            className="list-group-item d-flex justify-content-between"
                        >
                            {CATEGORIES[category]}
                            <span className="badge text-bg-primary">{counts[category] || 0}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </MainLayout>
    );
}

export default StatisticsPage;
