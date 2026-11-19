import { alertTokens } from '../alert/tokens';
import { asideTokens } from '../aside/tokens';
import { avatarTokens } from '../avatar/tokens';
import { badgeTokens } from '../badge/tokens';
import { barChartTokens } from '../bar-chart/tokens';
import { breadcrumbsTokens } from '../breadcrumbs/tokens';
import { buttonGroupTokens } from '../button-group/tokens';
import { buttonTokens } from '../button/tokens';
import { cardTokens } from '../card/tokens';
import { checkboxTokens } from '../checkbox/tokens';
import { commandPaletteTokens } from '../command-palette/tokens';
import { containerTokens } from '../container/tokens';
import { calendarTokens } from '../date-picker/calendarTokens';
import { dialogTokens } from '../dialog/tokens';
import { disclosureTokens } from '../disclosure/tokens';
import { dividerTokens } from '../divider/tokens';
import { emptyStateTokens } from '../empty-state/tokens';
import { inputTokens } from '../field/inputTokens';
import { fieldTokens } from '../field/tokens';
import { gridTokens } from '../grid/tokens';
import { headingTokens } from '../heading/tokens';
import { iconTokens } from '../icon/tokens';
import { inlineTokens } from '../inline/tokens';
import { lineChartTokens } from '../line-chart/tokens';
import { menuTokens } from '../menu/tokens';
import { meterTokens } from '../meter/tokens';
import { numberInputTokens } from '../number-input/tokens';
import { pillTriggerTokens } from '../pill-trigger/tokens';
import { popoverTokens } from '../popover/tokens';
import { proseTokens } from '../prose/tokens';
import { radioTokens } from '../radio-group/tokens';
import { segmentedControlTokens } from '../segmented-control/tokens';
import { listBoxTokens } from '../select/listBoxTokens';
import { skeletonTokens } from '../skeleton/tokens';
import { sparklineTokens } from '../sparkline/tokens';
import { spinnerTokens } from '../spinner/tokens';
import { stackTokens } from '../stack/tokens';
import { statTokens } from '../stat/tokens';
import { switchTokens } from '../switch/tokens';
import { tabsTokens } from '../tabs/tokens';
import { textTokens } from '../text/tokens';
import { tileTokens } from '../tile/tokens';
import { toastTokens } from '../toast/tokens';
import { tooltipTokens } from '../tooltip/tokens';
import { selectedTokens } from './selectedTokens';

/**
 * The component tokens of `@panneau/ui` and their defaults, by component: what a theme, a scope or
 * a project's CSS can set to restyle one component without touching the others (decision 0024).
 */
export const componentTokens = Object.freeze({
    alert: alertTokens.tokens,
    aside: asideTokens.tokens,
    avatar: avatarTokens.tokens,
    badge: badgeTokens.tokens,
    'bar-chart': barChartTokens.tokens,
    breadcrumbs: breadcrumbsTokens.tokens,
    button: buttonTokens.tokens,
    'button-group': buttonGroupTokens.tokens,
    calendar: calendarTokens.tokens,
    card: cardTokens.tokens,
    checkbox: checkboxTokens.tokens,
    'command-palette': commandPaletteTokens.tokens,
    container: containerTokens.tokens,
    dialog: dialogTokens.tokens,
    disclosure: disclosureTokens.tokens,
    divider: dividerTokens.tokens,
    'empty-state': emptyStateTokens.tokens,
    field: fieldTokens.tokens,
    grid: gridTokens.tokens,
    heading: headingTokens.tokens,
    icon: iconTokens.tokens,
    inline: inlineTokens.tokens,
    input: inputTokens.tokens,
    'line-chart': lineChartTokens.tokens,
    'list-box': listBoxTokens.tokens,
    menu: menuTokens.tokens,
    meter: meterTokens.tokens,
    'number-input': numberInputTokens.tokens,
    'pill-trigger': pillTriggerTokens.tokens,
    popover: popoverTokens.tokens,
    prose: proseTokens.tokens,
    radio: radioTokens.tokens,
    'segmented-control': segmentedControlTokens.tokens,
    selected: selectedTokens.tokens,
    skeleton: skeletonTokens.tokens,
    sparkline: sparklineTokens.tokens,
    spinner: spinnerTokens.tokens,
    stack: stackTokens.tokens,
    stat: statTokens.tokens,
    switch: switchTokens.tokens,
    tabs: tabsTokens.tokens,
    text: textTokens.tokens,
    tile: tileTokens.tokens,
    toast: toastTokens.tokens,
    tooltip: tooltipTokens.tokens,
});

/** The name of a component token of `@panneau/ui`, without the leading `--`. */
export type ComponentTokenName = {
    [Component in keyof typeof componentTokens]: keyof (typeof componentTokens)[Component];
}[keyof typeof componentTokens];
