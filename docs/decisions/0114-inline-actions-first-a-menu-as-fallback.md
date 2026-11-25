# 0114: Inline actions first, a menu as a fallback

- Status: accepted
- Date: 2026-11-25
- Amends: [0110](0110-related-items-are-created-and-edited-in-a-panel.md) (where "Edit" is in a narrow field), [0111](0111-reorder-by-a-handle.md) (where the moves of a card are in a narrow field)
- Uses: [0068](0068-collapsed-items-and-lighter-controls.md) (the tools of an item), [0072](0072-touch-targets-follow-the-density.md) (targets), [0095](0095-focus-and-announcements-in-lists.md) (focus)
- Issues: [#501](https://github.com/folkloreinc/panneau-js/issues/501), [#518](https://github.com/folkloreinc/panneau-js/issues/518)

## Context

A row with a title and a few buttons (the card of a relation, the header of an item of a repeater or of blocks) runs out of room in a sidebar, a panel or on a phone. Two rules had grown for it, each with its own width set in advance: a relation card put its actions in one "⋯" menu under 24rem (a container query on the field, #518), the items of a repeater under 30rem (#501). A width set in advance is wrong both ways: a card with one button and a short title gets a menu it doesn't need, and a card with four buttons, a status and a handle in the touch density cuts its title before the width is reached. The two rules also had to be kept in step by hand.

## Decision

- **The buttons show while they fit.** A row shows its actions as buttons, next to its title, while the title keeps its minimum width. When they don't fit, they are one "⋯" menu with the same actions, in the same order, named "Actions for" and the row's name. Never both, and never two menus in one row: the moves of a card are in its menu ([0111](0111-reorder-by-a-handle.md)).
- **Measured, not set in advance.** `useActionsFit()` (`@panneau/ui`) decides it from the room of the row, before the first paint and whenever the row or the buttons change size. The buttons stay rendered while the menu shows, out of sight and out of reach, so they are measured at the width they would have: the answer is the same in both states, and a row doesn't flip back and forth at the edge.
- **The title has the room first.** Its `min-width` (6rem in the fields) is what the row keeps for it; past it, it is cut with an ellipsis and shows in full in its tooltip, as before.
- **The focus follows.** When the buttons go into the menu while one of them has the focus, the focus goes to the menu.
- **One mechanism.** The cards of a relation field and the items of a repeater and of blocks use it, and so does any row that marks its parts: `data-actions-title` on the title, `data-actions-inline` on the buttons, `data-actions-menu` on the trigger of the menu. A card with one action keeps its button: a menu of one item hides it for nothing.

## Consequences

- The container queries of the relation field (24rem) and of the repeater (30rem) are gone, with their `tools-menu` classes.
- A field in a wide sidebar shows its buttons; a field in a narrow one, or in the touch density, shows its menu sooner. The stories check both at several widths (`Fields/Relation` `AtEveryWidth`, `Fields/Repeater` `ToolsWhereTheyFit`).
- The same principle fits other rows (tiles, the toolbar of a list) when they need it; they don't use it yet.
