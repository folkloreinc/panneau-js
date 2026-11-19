import type { ComponentType } from 'react';

import type { WidgetProps } from '@panneau/core';
import type { BuiltInWidgetType } from '@panneau/protocol/runtime';

import { BreakdownWidget } from './BreakdownWidget';
import { ListWidget } from './ListWidget';
import { MetricWidget } from './MetricWidget';
import { SeriesWidget } from './SeriesWidget';
import { StatWidget } from './StatWidget';
import { TableWidget } from './TableWidget';

/**
 * The built-in widget types (decision 0097), which plugins can replace by their type: each draws
 * its own card, and has its own module. Their data is checked against the protocol's schema of the
 * type before they get it, whoever draws them.
 */
export const builtInWidgets: Readonly<Record<BuiltInWidgetType, ComponentType<WidgetProps>>> = {
    stat: StatWidget,
    series: SeriesWidget,
    breakdown: BreakdownWidget,
    metric: MetricWidget,
    table: TableWidget,
    list: ListWidget,
};
