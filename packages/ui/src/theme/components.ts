import { alertTokens } from '../alert/tokens';
import { badgeTokens } from '../badge/tokens';
import { buttonTokens } from '../button/tokens';
import { cardTokens } from '../card/tokens';
import { checkboxTokens } from '../checkbox/tokens';
import { commandPaletteTokens } from '../command-palette/tokens';
import { containerTokens } from '../container/tokens';
import { calendarTokens } from '../date-picker/calendarTokens';
import { dialogTokens } from '../dialog/tokens';
import { disclosureTokens } from '../disclosure/tokens';
import { dividerTokens } from '../divider/tokens';
import { inputTokens } from '../field/inputTokens';
import { fieldTokens } from '../field/tokens';
import { gridTokens } from '../grid/tokens';
import { headingTokens } from '../heading/tokens';
import { inlineTokens } from '../inline/tokens';
import { numberInputTokens } from '../number-input/tokens';
import { popoverTokens } from '../popover/tokens';
import { proseTokens } from '../prose/tokens';
import { radioTokens } from '../radio-group/tokens';
import { segmentedControlTokens } from '../segmented-control/tokens';
import { listBoxTokens } from '../select/listBoxTokens';
import { spinnerTokens } from '../spinner/tokens';
import { stackTokens } from '../stack/tokens';
import { switchTokens } from '../switch/tokens';
import { tabsTokens } from '../tabs/tokens';
import { textTokens } from '../text/tokens';
import { toastTokens } from '../toast/tokens';
import { tooltipTokens } from '../tooltip/tokens';

/**
 * The component tokens of `@panneau/ui` and their defaults, by component: what a theme, a scope or
 * a project's CSS can set to restyle one component without touching the others (decision 0024).
 */
export const componentTokens = Object.freeze({
    alert: alertTokens.tokens,
    badge: badgeTokens.tokens,
    button: buttonTokens.tokens,
    calendar: calendarTokens.tokens,
    card: cardTokens.tokens,
    checkbox: checkboxTokens.tokens,
    'command-palette': commandPaletteTokens.tokens,
    container: containerTokens.tokens,
    dialog: dialogTokens.tokens,
    disclosure: disclosureTokens.tokens,
    divider: dividerTokens.tokens,
    field: fieldTokens.tokens,
    grid: gridTokens.tokens,
    heading: headingTokens.tokens,
    inline: inlineTokens.tokens,
    input: inputTokens.tokens,
    'list-box': listBoxTokens.tokens,
    'number-input': numberInputTokens.tokens,
    popover: popoverTokens.tokens,
    prose: proseTokens.tokens,
    radio: radioTokens.tokens,
    'segmented-control': segmentedControlTokens.tokens,
    spinner: spinnerTokens.tokens,
    stack: stackTokens.tokens,
    switch: switchTokens.tokens,
    tabs: tabsTokens.tokens,
    text: textTokens.tokens,
    toast: toastTokens.tokens,
    tooltip: tooltipTokens.tokens,
});

/** The name of a component token of `@panneau/ui`, without the leading `--`. */
export type ComponentTokenName = {
    [Component in keyof typeof componentTokens]: keyof (typeof componentTokens)[Component];
}[keyof typeof componentTokens];
