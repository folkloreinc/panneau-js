import { List } from 'lucide-react';
import { Link } from 'react-aria-components';

import { can } from '@panneau/core';
import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import { Icon, getNamedIcon, usePanneauIntl } from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import { capitalize } from '../navigation';
import { routePath } from '../routes';
import { PageHeader } from './PageHeader';
import styles from './pages.module.css';

export interface HomePageProps {
    definition: Definition;
    basePath: string;
}

/**
 * The home page, until the dashboard of 5.x: a welcome, and a card for each resource the user can
 * list.
 */
export function HomePage({ definition, basePath }: HomePageProps) {
    const intl = usePanneauIntl();
    const resources = definition.resources.filter((resource) => can(resource.abilities, 'viewAny'));
    const user = definition.user ?? null;
    useDocumentTitle([]);
    return (
        <div className={styles.page}>
            <PageHeader title={definition.name} />
            {user !== null ? (
                <p className={styles.intro}>
                    {intl.formatMessage(appMessages.welcome, { name: user.name })}
                </p>
            ) : null}
            <ul className={styles.cards}>
                {resources.map((resource) => (
                    <li key={resource.id}>
                        <Link
                            href={routePath(
                                { name: 'resource.index', resource: resource.id },
                                basePath,
                            )}
                            className={styles.card}
                        >
                            <span className={styles.cardIcon} aria-hidden="true">
                                <Icon
                                    icon={
                                        resource.icon !== undefined
                                            ? getNamedIcon(resource.icon)
                                            : List
                                    }
                                />
                            </span>
                            <span className={styles.cardTitle}>
                                {capitalize(resource.label.plural, definition.locale)}
                            </span>
                            {resource.description !== undefined ? (
                                <span className={styles.cardText}>{resource.description}</span>
                            ) : null}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
