# Coordinate-system migration inventory

This inventory is the Phase 1 safety record for
[`MIGRATION_STANDARD_COORDINATES.md`](../MIGRATION_STANDARD_COORDINATES.md).
It records every persisted or runtime field that represents a position,
direction, extent, or vertical offset. Runtime behaviour and persisted data use
one standard: a bottom-left map origin, positive Y upward, and sprite-centre
transforms. World distances remain pixels; screen/canvas coordinates remain
top-left/Y-down.

## Component and data conversion ownership

| Owner | Fields | Standard-coordinate rule | Implementation phase |
| --- | --- | --- | --- |
| `TransformComponent` | `position`, `scale`, `rotation` | Position is the sprite centre in Y-up world space; retain scale; positive rotation is counter-clockwise. | Gameplay + persisted data |
| `RigidBodyComponent` | `velocity`, `direction` | Uses Y-up vectors. | Gameplay + persisted data |
| `BoxColliderComponent` | `width`, `height`, `offset` | Extents are full sizes; offset is unscaled, local, centre-relative, and Y-up. | Gameplay + persisted data |
| `EntityDestinationComponent` | `destinationX`, `destinationY` | Absolute world point in Y-up space. | Gameplay + persisted data |
| `ParticleEmitComponent` | `offsetX`, `offsetY`, `particleVelocity` | Local offset and velocity use Y-up. | Gameplay + persisted data |
| `ShadowComponent` | `offsetX`, `offsetY` | `offsetX` is centre-relative; `offsetY` is a Y-up adjustment from the scaled sprite's bottom edge. | Renderer + persisted data |
| `HighlightComponent` | `offsetX`, `offsetY` | Local offsets are centre-relative and Y-up. | Renderer + persisted data |
| `TextLabelComponent` | `offset` | Local Y-up offset; render text upright in the world pass. | Renderer + persisted data |
| `ScriptComponent` | `scripts[].movement` | Movement vectors use Y-up. | Gameplay + persisted data |
| `SpriteComponent` | `width`, `height`, `flip`, sprite-sheet fields | Dimensions feed centre bounds; bitmap orientation is handled locally by the renderer. | Renderer |
| `DamageRadiusComponent`, `SlowTimeComponent`, `EntityFollowComponent`, `LightEmitComponent` | radius/distance fields | Scalar distances; their world centres come from the transform. | Gameplay |
| `Engine` and game/editor input | `mousePositionScreen`, `mousePositionWorld` | Screen coordinates do not change. Replace all world conversion with `screenToWorld`. | Rendering/input |
| Camera state | `Rectangle.x/y/width/height` | Replace with a centre-based world camera; do not serialize it. | Shared API + renderer/editor |
| `LevelMap` | map dimensions and component maps | Stores only standard-coordinate component data; no version or compatibility conversion is retained. | Persisted data |

## Non-persisted code paths requiring an audit

- Game renderers: sprites, particles, lighting, text, health bars, cursor,
  shadows, highlights, and all debug renderers.
- Gameplay systems: movement, AABB collision/normal resolution, follow,
  detection, destination movement, player control, ranged attacks, teleport,
  damage/effects, particles, culling, and scripting.
- Editor systems: camera pan/zoom, grid, border, sprites/invisible entities,
  marquee selection, entity dragging, snapping, copy/paste, inspector position
  fields, and test-mode input.
