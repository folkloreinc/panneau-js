import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of SegmentedControl. */
export const segmentedControlTokens = defineComponentTokens('segmented-control', {
    /** Background of the group, behind the segments. */
    bg: 'var(--panneau-color-surface-sunken)',
    /** Color of the border around the group. */
    'border-color': 'var(--panneau-color-border)',
    /** Corner radius of the group. */
    radius: 'var(--panneau-radius-md)',
    /** Space between the group's border and its segments. */
    padding: '2px',
    /** Horizontal padding of a segment. */
    'segment-padding-x': 'var(--panneau-space-3)',
    /** Font weight of a segment. */
    'segment-font-weight': 'var(--panneau-font-weight-medium)',
    /** Text color of a segment. */
    'segment-color': 'var(--panneau-color-text-muted)',
    /** Text color of the selected segment, and of a hovered one. */
    'segment-color-selected': 'var(--panneau-color-text)',
    /** Background of the selected segment. */
    'segment-bg-selected': 'var(--panneau-color-surface-raised)',
    /** Shadow of the selected segment. */
    'segment-shadow-selected': 'var(--panneau-shadow-sm)',
});
