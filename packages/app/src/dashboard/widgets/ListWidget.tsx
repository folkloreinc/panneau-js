import { Link } from 'react-aria-components';

import type { WidgetProps } from '@panneau/core';
import { appMessages } from '@panneau/intl';
import type { ListWidgetData, Widget } from '@panneau/protocol';
import { Badge, Card, EmptyState, Tile, TileGroup, type Tone, usePanneauIntl } from '@panneau/ui';

import styles from '../Dashboard.module.css';

function ListBody({ widget, data }: { widget: Widget; data: ListWidgetData }) {
    const intl = usePanneauIntl();
    const url = data.url ?? undefined;
    return (
        <Card
            title={widget.label}
            className={styles.widget}
            footer={
                url !== undefined ? (
                    <Link href={url} className={styles.seeAll}>
                        {intl.formatMessage(appMessages.widgetSeeAll)}
                    </Link>
                ) : undefined
            }
        >
            {data.items.length === 0 ? (
                <EmptyState
                    size="sm"
                    title={data.empty ?? intl.formatMessage(appMessages.widgetEmpty)}
                />
            ) : (
                <TileGroup className={styles.items}>
                    {data.items.map((item, index) => {
                        const meta = item.meta ?? null;
                        const badge = item.badge ?? null;
                        return (
                            <Tile
                                key={index}
                                size="sm"
                                title={item.title}
                                description={item.description}
                                href={item.url ?? undefined}
                                actions={
                                    meta !== null || badge !== null ? (
                                        <>
                                            {meta !== null ? (
                                                <span className={styles.itemMeta}>{meta}</span>
                                            ) : null}
                                            {badge !== null ? (
                                                <Badge tone={(badge.tone ?? 'neutral') as Tone}>
                                                    {badge.label}
                                                </Badge>
                                            ) : null}
                                        </>
                                    ) : undefined
                                }
                            />
                        );
                    })}
                </TileGroup>
            )}
        </Card>
    );
}

/**
 * The `list` widget (decision 0097): items of a resource, with links to them. Its data is checked
 * against the protocol's schema of `list` before it gets it.
 */
export function ListWidget({ widget, data }: WidgetProps) {
    return <ListBody widget={widget} data={data as ListWidgetData} />;
}
