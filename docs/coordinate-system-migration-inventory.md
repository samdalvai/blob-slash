# Coordinate-system migration inventory

This inventory is the Phase 1 safety record for
[`MIGRATION_STANDARD_COORDINATES.md`](../MIGRATION_STANDARD_COORDINATES.md).
It records every persisted or runtime field that represents a position,
direction, extent, or vertical offset. Runtime behaviour is still legacy
coordinate-system version 1 until the later phases deliberately replace it.

## Coordinate versions

| Version | World origin and Y axis | Transform origin |
| --- | --- | --- |
| 1 (current) | Map top-left; Y increases down | Sprite top-left |
| 2 (target) | Map bottom-left; Y increases up | Sprite centre |

World distances remain pixels in both versions. Screen/canvas coordinates stay
top-left/Y-down in every version.

## Component and data conversion ownership

| Owner | Fields | v1 to v2 rule | Implementation phase |
| --- | --- | --- | --- |
| `TransformComponent` | `position`, `scale`, `rotation` | With scaled sprite dimensions `w`, `h`: `x = oldX + w / 2`, `y = mapHeight - (oldY + h / 2)`; retain scale; negate rotation to preserve its visual orientation when reinterpreting it as positive counter-clockwise. | Gameplay + level migration |
| `RigidBodyComponent` | `velocity`, `direction` | Retain X; negate Y. | Gameplay + level migration |
| `BoxColliderComponent` | `width`, `height`, `offset` | Keep extents. Target offsets are unscaled local values. For sprite size `(sw, sh)`, collider size `(cw, ch)`, legacy offset `(ox, oy)`, and non-zero scale `(sx, sy)`, write `x = ox / sx + (cw - sw) / 2`, `y = -(oy / sy + (ch - sh) / 2)`. | Gameplay + level migration |
| `EntityDestinationComponent` | `destinationX`, `destinationY` | Retain X; convert absolute Y as `mapHeight - oldY`. | Gameplay + level migration |
| `ParticleEmitComponent` | `offsetX`, `offsetY`, `particleVelocity` | Retain X values; negate both Y values. | Gameplay + level migration |
| `ShadowComponent`, `HighlightComponent` | `offsetX`, `offsetY` | Retain X; negate Y after their renderer anchor is changed from sprite edge to centre. | Renderer + level migration |
| `TextLabelComponent` | `offset` | Retain X; negate Y. Render text upright in the world pass. | Renderer + level migration |
| `ScriptComponent` | `scripts[].movement` | Retain X; negate Y for every script action. | Gameplay + level migration |
| `SpriteComponent` | `width`, `height`, `flip`, sprite-sheet fields | No data conversion. Dimensions feed transform/collider conversion; bitmap orientation is handled locally by the renderer. | Renderer |
| `DamageRadiusComponent`, `SlowTimeComponent`, `EntityFollowComponent`, `LightEmitComponent` | radius/distance fields | No conversion: these are scalar distances. Their world centres come from the transform. | Gameplay |
| `Engine` and game/editor input | `mousePositionScreen`, `mousePositionWorld` | Screen coordinates do not change. Replace all world conversion with `screenToWorld`. | Rendering/input |
| Camera state | `Rectangle.x/y/width/height` | Replace with a centre-based world camera; do not serialize it. | Shared API + renderer/editor |
| `LevelMap` | map dimensions and component maps | Add `coordinateSystemVersion`; absent is v1. Convert component maps before deserialization and always save v2. | Level migration |

## Non-persisted code paths requiring an audit

- Game renderers: sprites, particles, lighting, text, health bars, cursor,
  shadows, highlights, and all debug renderers.
- Gameplay systems: movement, AABB collision/normal resolution, follow,
  detection, destination movement, player control, ranged attacks, teleport,
  damage/effects, particles, culling, and scripting.
- Editor systems: camera pan/zoom, grid, border, sprites/invisible entities,
  marquee selection, entity dragging, snapping, copy/paste, inspector position
  fields, and test-mode input.

The legacy fixture at
[`src/test-fixtures/legacyLevelMap.ts`](../src/test-fixtures/legacyLevelMap.ts)
intentionally exercises the coordinate-bearing serialized component fields.
