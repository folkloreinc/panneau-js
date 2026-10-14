# 0010: Media through the protocol, non-destructive image editing

- Status: accepted
- Date: 2026-10-14

## Context

The v4 media library calls a `medias/*` API that `laravel-panneau` doesn't provide. Projects that have one get it from `laravel-folklore` and `laravel-mediatheque`. Niche needs its own scoped media API. Image editing doesn't exist.

## Decision

- **Media is part of the protocol:**
    - list and search;
    - upload (multipart, TUS or presigned);
    - metadata, tags, replacing the file;
    - trash and restore;
    - image transforms.
- **`laravel-panneau` provides the endpoints** through an adapter interface. The adapter for `laravel-mediatheque` is optional: the dependency is suggested, not required.
- **Image editing is non-destructive.** Crop, rotation, flip and focal point are stored as a `transform` on the media item, or on the field value when the edit is per usage. The original file is never changed. URLs are rendered by `laravel-image`, and the focal point is used for automatic crops.
- **Library features follow the `laravel-mediatheque` roadmap:** conversions, tags, search and usage tracking.

## Consequences

- Fields and the library work with any backend that implements the media endpoints.
- 5.0 ships media fields and a basic library. Image editing and the advanced library come in 5.x.
