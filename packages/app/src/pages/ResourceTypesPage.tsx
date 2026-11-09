import { FilePlus } from 'lucide-react';
import { Link } from 'react-aria-components';

import type { ResolvedResource } from '@panneau/core';
import { appMessages } from '@panneau/intl';
import { getCreatableTypes } from '@panneau/protocol/runtime';
import { Icon, getNamedIcon, usePanneauIntl } from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import { capitalize } from '../navigation';
import { routePath } from '../routes';
import { PageHeader, PageLayout } from './PageHeader';
import styles from './pages.module.css';

export interface ResourceTypesPageProps {
    resolved: ResolvedResource;
    basePath: string;
    locale: string;
}

/**
 * The create route of a resource with types (decision 0076): a card for each type the user can
 * create, which opens its form.
 */
export function ResourceTypesPage({ resolved, basePath, locale }: ResourceTypesPageProps) {
    const intl = usePanneauIntl();
    const { resource } = resolved;
    const title = intl.formatMessage(appMessages.create, { resource: resource.label.singular });
    const back = {
        href: routePath({ name: 'resource.index', resource: resource.id }, basePath),
        label: capitalize(resource.label.plural, locale),
    };
    useDocumentTitle([title, back.label]);
    return (
        <PageLayout width="narrow">
            <PageHeader title={title} back={back} />
            <p className={styles.intro}>
                {intl.formatMessage(appMessages.chooseType, {
                    resource: resource.label.singular,
                })}
            </p>
            <ul className={styles.cards}>
                {getCreatableTypes(resource).map((type) => (
                    <li key={type.id}>
                        <Link
                            href={routePath(
                                { name: 'resource.create', resource: resource.id, type: type.id },
                                basePath,
                            )}
                            className={styles.card}
                        >
                            <span className={styles.cardIcon} aria-hidden="true">
                                <Icon
                                    icon={
                                        type.icon !== undefined ? getNamedIcon(type.icon) : FilePlus
                                    }
                                />
                            </span>
                            <span className={styles.cardTitle}>{type.label}</span>
                            {type.description !== undefined ? (
                                <span className={styles.cardText}>{type.description}</span>
                            ) : null}
                        </Link>
                    </li>
                ))}
            </ul>
        </PageLayout>
    );
}
