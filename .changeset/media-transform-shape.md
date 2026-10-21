---
'@panneau/protocol': minor
---

`MediaTransform` states how renderers read it, as agreed with `laravel-image` 2 and `laravel-mediatheque` 2: the crop is in whole pixels of the upright original image (integers, `x` and `y` from 0, `width` and `height` from 1), the rotation is clockwise, the edits apply in the order crop, rotate, flip, and the focal point is relative to the upright original, not to the crop. **Breaking:** a crop with fractional pixels is now invalid.
